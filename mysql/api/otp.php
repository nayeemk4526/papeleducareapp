<?php
/**
 * OTP API Endpoints
 * - POST /otp.php?action=send - Send OTP to phone
 * - POST /otp.php?action=verify - Verify OTP
 * - POST /otp.php?action=resend - Resend OTP
 */

require_once 'config.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'send':
        handleSendOTP();
        break;
    case 'verify':
        handleVerifyOTP();
        break;
    case 'resend':
        handleResendOTP();
        break;
    default:
        jsonResponse(['error' => 'Invalid action'], 400);
}

/**
 * Generate 6-digit OTP
 */
function generateOTP(): string {
    return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
}

/**
 * Send SMS using MiM Digital Marketing Solution Ltd. API
 */
function sendSMS(string $phone, string $message): bool {
    $apiKey = SMS_API_KEY;
    $senderId = SMS_SENDER_ID;
    
    // Format phone number (remove +88 prefix if exists)
    $phone = preg_replace('/^\+?88/', '', $phone);
    
    // Build API URL
    $url = "http://bulksmsbd.net/api/smsapi";
    $data = [
        'api_key' => $apiKey,
        'type' => 'text',
        'number' => $phone,
        'senderid' => $senderId,
        'message' => $message,
    ];
    
    try {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        // Log for debugging
        error_log("SMS API Response: " . $response);
        
        return $httpCode >= 200 && $httpCode < 300;
    } catch (Exception $e) {
        error_log("SMS Send Error: " . $e->getMessage());
        return false;
    }
}

/**
 * Send OTP for registration
 */
function handleSendOTP(): void {
    $input = getJsonInput();
    
    if (!isset($input['phone']) || empty($input['phone'])) {
        jsonResponse(['error' => 'ফোন নম্বর দিন'], 400);
    }
    
    $phone = preg_replace('/[^0-9]/', '', $input['phone']);
    
    // Validate Bangladeshi phone number
    if (!preg_match('/^01[3-9]\d{8}$/', $phone)) {
        jsonResponse(['error' => 'সঠিক বাংলাদেশী ফোন নম্বর দিন'], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Check if phone already exists in users
    $stmt = $db->prepare("SELECT id FROM users WHERE phone = ?");
    $stmt->execute([$phone]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'এই ফোন নম্বর দিয়ে আগেই অ্যাকাউন্ট তৈরি করা হয়েছে'], 400);
    }
    
    // Generate OTP
    $otp = generateOTP();
    $expiresAt = date('Y-m-d H:i:s', strtotime('+5 minutes'));
    
    // Delete old OTPs for this phone
    $stmt = $db->prepare("DELETE FROM otp_verifications WHERE phone = ? AND purpose = 'registration'");
    $stmt->execute([$phone]);
    
    // Insert new OTP
    $stmt = $db->prepare("INSERT INTO otp_verifications (phone, otp_code, purpose, expires_at) VALUES (?, ?, 'registration', ?)");
    $stmt->execute([$phone, $otp, $expiresAt]);
    
    // Send SMS
    $message = "পাপেল এডু-কেয়ার: আপনার OTP কোড হলো {$otp}। এই কোড ৫ মিনিট পর্যন্ত বৈধ থাকবে।";
    $smsSent = sendSMS($phone, $message);
    
    if (!$smsSent) {
        // For development, return OTP in response (remove in production)
        jsonResponse([
            'success' => true,
            'message' => 'OTP পাঠানো হয়েছে',
            'dev_otp' => $otp, // Remove this in production
        ]);
    }
    
    jsonResponse([
        'success' => true,
        'message' => 'আপনার ফোনে OTP পাঠানো হয়েছে',
    ]);
}

/**
 * Verify OTP and complete registration
 */
function handleVerifyOTP(): void {
    $input = getJsonInput();
    
    $error = validateRequired($input, ['phone', 'otp', 'full_name', 'email', 'password']);
    if ($error) {
        jsonResponse(['error' => $error], 400);
    }
    
    $phone = preg_replace('/[^0-9]/', '', $input['phone']);
    $otp = $input['otp'];
    $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
    
    if (!$email) {
        jsonResponse(['error' => 'সঠিক ইমেইল দিন'], 400);
    }
    
    if (strlen($input['password']) < 6) {
        jsonResponse(['error' => 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Verify OTP
    $stmt = $db->prepare("
        SELECT * FROM otp_verifications 
        WHERE phone = ? AND otp_code = ? AND purpose = 'registration' 
        AND expires_at > NOW() AND is_verified = FALSE AND attempts < 5
    ");
    $stmt->execute([$phone, $otp]);
    $otpRecord = $stmt->fetch();
    
    if (!$otpRecord) {
        // Increment attempts
        $stmt = $db->prepare("UPDATE otp_verifications SET attempts = attempts + 1 WHERE phone = ? AND purpose = 'registration'");
        $stmt->execute([$phone]);
        
        jsonResponse(['error' => 'ভুল বা মেয়াদ উত্তীর্ণ OTP'], 400);
    }
    
    // Check if email already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট তৈরি করা হয়েছে'], 400);
    }
    
    // Check if phone already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE phone = ?");
    $stmt->execute([$phone]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'এই ফোন নম্বর দিয়ে আগেই অ্যাকাউন্ট তৈরি করা হয়েছে'], 400);
    }
    
    try {
        $db->beginTransaction();
        
        // Mark OTP as verified
        $stmt = $db->prepare("UPDATE otp_verifications SET is_verified = TRUE WHERE id = ?");
        $stmt->execute([$otpRecord['id']]);
        
        // Create user
        $passwordHash = password_hash($input['password'], PASSWORD_BCRYPT);
        $stmt = $db->prepare("INSERT INTO users (email, phone, password_hash, phone_verified_at) VALUES (?, ?, ?, NOW())");
        $stmt->execute([$email, $phone, $passwordHash]);
        $userId = $db->lastInsertId();
        
        // Create profile
        $stmt = $db->prepare("INSERT INTO profiles (user_id, full_name, email, phone) VALUES (?, ?, ?, ?)");
        $stmt->execute([$userId, $input['full_name'], $email, $phone]);
        
        // Assign default student role
        $stmt = $db->prepare("INSERT INTO user_roles (user_id, role) VALUES (?, 'student')");
        $stmt->execute([$userId]);
        
        $db->commit();
        
        // Generate JWT token
        $token = generateJWT([
            'user_id' => $userId,
            'email' => $email,
            'phone' => $phone,
        ]);
        
        // Get profile
        $stmt = $db->prepare("SELECT * FROM profiles WHERE user_id = ?");
        $stmt->execute([$userId]);
        $profile = $stmt->fetch();
        
        jsonResponse([
            'success' => true,
            'message' => 'রেজিস্ট্রেশন সফল হয়েছে!',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'email' => $email,
                'phone' => $phone,
            ],
            'profile' => $profile,
            'roles' => ['student'],
        ]);
        
    } catch (Exception $e) {
        $db->rollBack();
        error_log("Registration Error: " . $e->getMessage());
        jsonResponse(['error' => 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে'], 500);
    }
}

/**
 * Resend OTP
 */
function handleResendOTP(): void {
    $input = getJsonInput();
    
    if (!isset($input['phone']) || empty($input['phone'])) {
        jsonResponse(['error' => 'ফোন নম্বর দিন'], 400);
    }
    
    $phone = preg_replace('/[^0-9]/', '', $input['phone']);
    
    $db = Database::getInstance()->getConnection();
    
    // Check rate limiting (max 3 OTPs per phone per hour)
    $stmt = $db->prepare("
        SELECT COUNT(*) as count FROM otp_verifications 
        WHERE phone = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
    ");
    $stmt->execute([$phone]);
    $result = $stmt->fetch();
    
    if ($result['count'] >= 3) {
        jsonResponse(['error' => 'অনেক বার চেষ্টা করেছেন। ১ ঘন্টা পর আবার চেষ্টা করুন'], 429);
    }
    
    // Generate new OTP
    $otp = generateOTP();
    $expiresAt = date('Y-m-d H:i:s', strtotime('+5 minutes'));
    
    // Delete old unverified OTPs
    $stmt = $db->prepare("DELETE FROM otp_verifications WHERE phone = ? AND purpose = 'registration' AND is_verified = FALSE");
    $stmt->execute([$phone]);
    
    // Insert new OTP
    $stmt = $db->prepare("INSERT INTO otp_verifications (phone, otp_code, purpose, expires_at) VALUES (?, ?, 'registration', ?)");
    $stmt->execute([$phone, $otp, $expiresAt]);
    
    // Send SMS
    $message = "পাপেল এডু-কেয়ার: আপনার নতুন OTP কোড হলো {$otp}। এই কোড ৫ মিনিট পর্যন্ত বৈধ থাকবে।";
    $smsSent = sendSMS($phone, $message);
    
    jsonResponse([
        'success' => true,
        'message' => 'নতুন OTP পাঠানো হয়েছে',
        'dev_otp' => $smsSent ? null : $otp, // For development only
    ]);
}
