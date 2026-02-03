<?php
/**
 * Authentication API Endpoints
 * - POST /auth.php?action=register - Register new user
 * - POST /auth.php?action=login - Login user
 * - POST /auth.php?action=logout - Logout user
 * - GET /auth.php?action=me - Get current user
 * - POST /auth.php?action=forgot-password - Request password reset
 * - POST /auth.php?action=reset-password - Reset password
 */

require_once 'config.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'register':
        handleRegister();
        break;
    case 'login':
        handleLogin();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'me':
        handleGetMe();
        break;
    case 'forgot-password':
        handleForgotPassword();
        break;
    case 'reset-password':
        handleResetPassword();
        break;
    default:
        jsonResponse(['error' => 'Invalid action'], 400);
}

function handleRegister(): void {
    $input = getJsonInput();
    
    // Validate required fields
    $error = validateRequired($input, ['email', 'password', 'full_name', 'phone']);
    if ($error) {
        jsonResponse(['error' => $error], 400);
    }
    
    $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) {
        jsonResponse(['error' => 'সঠিক ইমেইল দিন'], 400);
    }
    
    if (strlen($input['password']) < 6) {
        jsonResponse(['error' => 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Check if email already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট তৈরি করা হয়েছে'], 400);
    }
    
    try {
        $db->beginTransaction();
        
        // Create user
        $passwordHash = password_hash($input['password'], PASSWORD_BCRYPT);
        $stmt = $db->prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
        $stmt->execute([$email, $passwordHash]);
        $userId = $db->lastInsertId();
        
        // Create profile
        $stmt = $db->prepare("INSERT INTO profiles (user_id, full_name, email, phone) VALUES (?, ?, ?, ?)");
        $stmt->execute([$userId, $input['full_name'], $email, $input['phone']]);
        
        // Assign default student role
        $stmt = $db->prepare("INSERT INTO user_roles (user_id, role) VALUES (?, 'student')");
        $stmt->execute([$userId]);
        
        $db->commit();
        
        // Generate JWT token
        $token = generateJWT([
            'user_id' => $userId,
            'email' => $email,
        ]);
        
        // Get profile
        $stmt = $db->prepare("SELECT * FROM profiles WHERE user_id = ?");
        $stmt->execute([$userId]);
        $profile = $stmt->fetch();
        
        jsonResponse([
            'success' => true,
            'message' => 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'email' => $email,
            ],
            'profile' => $profile,
        ]);
        
    } catch (Exception $e) {
        $db->rollBack();
        jsonResponse(['error' => 'অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে'], 500);
    }
}

function handleLogin(): void {
    $input = getJsonInput();
    
    $error = validateRequired($input, ['email', 'password']);
    if ($error) {
        jsonResponse(['error' => $error], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Find user
    $stmt = $db->prepare("SELECT id, email, password_hash FROM users WHERE email = ?");
    $stmt->execute([$input['email']]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($input['password'], $user['password_hash'])) {
        jsonResponse(['error' => 'ইমেইল বা পাসওয়ার্ড ভুল'], 401);
    }
    
    // Generate JWT token
    $token = generateJWT([
        'user_id' => $user['id'],
        'email' => $user['email'],
    ]);
    
    // Get profile
    $stmt = $db->prepare("SELECT * FROM profiles WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    $profile = $stmt->fetch();
    
    // Get roles
    $stmt = $db->prepare("SELECT role FROM user_roles WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    $roles = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    jsonResponse([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
        ],
        'profile' => $profile,
        'roles' => $roles,
    ]);
}

function handleLogout(): void {
    // For JWT-based auth, logout is handled client-side by removing the token
    jsonResponse(['success' => true, 'message' => 'লগআউট সফল']);
}

function handleGetMe(): void {
    $authUser = requireAuth();
    
    $db = Database::getInstance()->getConnection();
    
    // Get user
    $stmt = $db->prepare("SELECT id, email FROM users WHERE id = ?");
    $stmt->execute([$authUser['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        jsonResponse(['error' => 'ইউজার পাওয়া যায়নি'], 404);
    }
    
    // Get profile
    $stmt = $db->prepare("SELECT * FROM profiles WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    $profile = $stmt->fetch();
    
    // Get roles
    $stmt = $db->prepare("SELECT role FROM user_roles WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    $roles = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    jsonResponse([
        'user' => $user,
        'profile' => $profile,
        'roles' => $roles,
        'is_admin' => in_array('admin', $roles),
        'is_teacher' => in_array('teacher', $roles),
    ]);
}

function handleForgotPassword(): void {
    $input = getJsonInput();
    
    if (!isset($input['email']) || !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'সঠিক ইমেইল দিন'], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Check if user exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$input['email']]);
    if (!$stmt->fetch()) {
        // Don't reveal if email exists
        jsonResponse(['success' => true, 'message' => 'পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে']);
    }
    
    // Generate reset token
    $token = bin2hex(random_bytes(32));
    
    // Delete old tokens
    $stmt = $db->prepare("DELETE FROM password_resets WHERE email = ?");
    $stmt->execute([$input['email']]);
    
    // Insert new token
    $stmt = $db->prepare("INSERT INTO password_resets (email, token) VALUES (?, ?)");
    $stmt->execute([$input['email'], $token]);
    
    // TODO: Send email with reset link
    // $resetLink = APP_URL . "/reset-password?token=" . $token;
    
    jsonResponse(['success' => true, 'message' => 'পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে']);
}

function handleResetPassword(): void {
    $input = getJsonInput();
    
    $error = validateRequired($input, ['token', 'password']);
    if ($error) {
        jsonResponse(['error' => $error], 400);
    }
    
    if (strlen($input['password']) < 6) {
        jsonResponse(['error' => 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Find valid token (within 1 hour)
    $stmt = $db->prepare("
        SELECT email FROM password_resets 
        WHERE token = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
    ");
    $stmt->execute([$input['token']]);
    $reset = $stmt->fetch();
    
    if (!$reset) {
        jsonResponse(['error' => 'অবৈধ বা মেয়াদ উত্তীর্ণ টোকেন'], 400);
    }
    
    // Update password
    $passwordHash = password_hash($input['password'], PASSWORD_BCRYPT);
    $stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
    $stmt->execute([$passwordHash, $reset['email']]);
    
    // Delete used token
    $stmt = $db->prepare("DELETE FROM password_resets WHERE email = ?");
    $stmt->execute([$reset['email']]);
    
    jsonResponse(['success' => true, 'message' => 'পাসওয়ার্ড সফলভাবে রিসেট হয়েছে']);
}
