<?php
/**
 * Payments API Endpoints
 * - GET /payments.php - Get user's payment history
 * - GET /payments.php?id=1 - Get payment details
 * - POST /payments.php?action=process - Process manual payment
 * - POST /payments.php?action=bkash - Initiate bKash payment
 * - GET /payments.php?action=bkash-callback - bKash callback
 * - POST /payments.php?action=verify - Admin verify payment
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'bkash-callback') {
            handleBkashCallback();
        } else {
            handleGet();
        }
        break;
    case 'POST':
        switch ($action) {
            case 'process':
                handleProcessPayment();
                break;
            case 'bkash':
                handleBkashPayment();
                break;
            case 'verify':
                handleVerifyPayment();
                break;
            default:
                jsonResponse(['error' => 'Invalid action'], 400);
        }
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function handleGet(): void {
    $user = requireAuth();
    $db = Database::getInstance()->getConnection();
    
    // Get single payment
    if (isset($_GET['id'])) {
        $stmt = $db->prepare("
            SELECT p.*, c.title as course_title, c.thumbnail_url as course_thumbnail
            FROM payments p
            LEFT JOIN courses c ON p.course_id = c.id
            WHERE p.id = ? AND p.user_id = ?
        ");
        $stmt->execute([$_GET['id'], $user['user_id']]);
        $payment = $stmt->fetch();
        
        if (!$payment) {
            jsonResponse(['error' => 'পেমেন্ট পাওয়া যায়নি'], 404);
        }
        
        jsonResponse($payment);
    }
    
    // Get user's payment history
    $stmt = $db->prepare("
        SELECT p.*, c.title as course_title, c.thumbnail_url as course_thumbnail
        FROM payments p
        LEFT JOIN courses c ON p.course_id = c.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
    ");
    $stmt->execute([$user['user_id']]);
    $payments = $stmt->fetchAll();
    
    jsonResponse(['data' => $payments]);
}

function handleProcessPayment(): void {
    $user = requireAuth();
    $input = getJsonInput();
    
    $error = validateRequired($input, ['course_id', 'amount', 'payment_method', 'transaction_id']);
    if ($error) {
        jsonResponse(['error' => $error], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Verify course exists
    $stmt = $db->prepare("SELECT id, title, price, discount_price FROM courses WHERE id = ? AND is_published = 1");
    $stmt->execute([$input['course_id']]);
    $course = $stmt->fetch();
    
    if (!$course) {
        jsonResponse(['error' => 'কোর্স পাওয়া যায়নি'], 404);
    }
    
    // Check if already enrolled
    if (isEnrolled($user['user_id'], $input['course_id'])) {
        jsonResponse(['error' => 'আপনি ইতিমধ্যে এই কোর্সে এনরোল করেছেন'], 400);
    }
    
    // Create payment record
    $stmt = $db->prepare("
        INSERT INTO payments (
            user_id, course_id, amount, payment_method, transaction_id,
            status, billing_info, gateway_response
        ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
    ");
    
    $stmt->execute([
        $user['user_id'],
        $input['course_id'],
        $input['amount'],
        $input['payment_method'],
        $input['transaction_id'],
        json_encode($input['billing_info'] ?? []),
        json_encode([
            'phone_number' => $input['phone_number'] ?? '',
            'submitted_at' => date('c'),
        ]),
    ]);
    
    $paymentId = $db->lastInsertId();
    
    // Create notification
    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, 'payment', '/dashboard/payments')
    ");
    $stmt->execute([
        $user['user_id'],
        'পেমেন্ট জমা হয়েছে',
        "আপনার \"{$course['title']}\" কোর্সের পেমেন্ট জমা হয়েছে। যাচাই করা হচ্ছে...",
    ]);
    
    jsonResponse([
        'success' => true,
        'message' => 'পেমেন্ট সফলভাবে জমা হয়েছে। অ্যাডমিন যাচাই করার পর আপনাকে জানানো হবে।',
        'payment_id' => $paymentId,
    ]);
}

function handleBkashPayment(): void {
    $user = requireAuth();
    $input = getJsonInput();
    
    $error = validateRequired($input, ['course_id', 'amount', 'phone_number']);
    if ($error) {
        jsonResponse(['error' => $error], 400);
    }
    
    // Check bKash credentials
    if (empty(BKASH_APP_KEY) || empty(BKASH_APP_SECRET) || empty(BKASH_USERNAME) || empty(BKASH_PASSWORD)) {
        jsonResponse(['error' => 'বিকাশ সেটআপ সম্পূর্ণ নয়'], 500);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Verify course exists
    $stmt = $db->prepare("SELECT id, title FROM courses WHERE id = ? AND is_published = 1");
    $stmt->execute([$input['course_id']]);
    $course = $stmt->fetch();
    
    if (!$course) {
        jsonResponse(['error' => 'কোর্স পাওয়া যায়নি'], 404);
    }
    
    // Check if already enrolled
    if (isEnrolled($user['user_id'], $input['course_id'])) {
        jsonResponse(['error' => 'আপনি ইতিমধ্যে এই কোর্সে এনরোল করেছেন'], 400);
    }
    
    // Step 1: Grant Token
    $tokenResponse = file_get_contents(BKASH_BASE_URL . '/tokenized/checkout/token/grant', false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => [
                'Content-Type: application/json',
                'Accept: application/json',
                'username: ' . BKASH_USERNAME,
                'password: ' . BKASH_PASSWORD,
            ],
            'content' => json_encode([
                'app_key' => BKASH_APP_KEY,
                'app_secret' => BKASH_APP_SECRET,
            ]),
        ],
    ]));
    
    $tokenData = json_decode($tokenResponse, true);
    
    if (!isset($tokenData['id_token'])) {
        jsonResponse(['error' => 'বিকাশ টোকেন পেতে সমস্যা হয়েছে'], 500);
    }
    
    $idToken = $tokenData['id_token'];
    $paymentId = 'PAY-' . time() . '-' . strtoupper(substr(md5(rand()), 0, 6));
    $callbackURL = API_URL . '/payments.php?action=bkash-callback';
    
    // Step 2: Create Payment
    $createResponse = file_get_contents(BKASH_BASE_URL . '/tokenized/checkout/create', false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => [
                'Content-Type: application/json',
                'Accept: application/json',
                'Authorization: ' . $idToken,
                'X-APP-Key: ' . BKASH_APP_KEY,
            ],
            'content' => json_encode([
                'mode' => '0011',
                'payerReference' => $user['user_id'],
                'callbackURL' => $callbackURL,
                'amount' => strval($input['amount']),
                'currency' => 'BDT',
                'intent' => 'sale',
                'merchantInvoiceNumber' => $paymentId,
            ]),
        ],
    ]));
    
    $createData = json_decode($createResponse, true);
    
    if (!isset($createData['bkashURL'])) {
        jsonResponse(['error' => $createData['statusMessage'] ?? 'বিকাশ পেমেন্ট তৈরি করতে সমস্যা হয়েছে'], 500);
    }
    
    // Store pending payment
    $stmt = $db->prepare("
        INSERT INTO payments (
            user_id, course_id, amount, payment_method, transaction_id,
            status, billing_info, gateway_response
        ) VALUES (?, ?, ?, 'bkash', ?, 'pending', ?, ?)
    ");
    
    $stmt->execute([
        $user['user_id'],
        $input['course_id'],
        $input['amount'],
        $createData['paymentID'],
        json_encode($input['billing_info'] ?? []),
        json_encode([
            'bkash_payment_id' => $createData['paymentID'],
            'merchant_invoice' => $paymentId,
            'id_token' => $idToken,
        ]),
    ]);
    
    jsonResponse([
        'success' => true,
        'bkashURL' => $createData['bkashURL'],
        'paymentID' => $createData['paymentID'],
    ]);
}

function handleBkashCallback(): void {
    $paymentID = $_GET['paymentID'] ?? '';
    $status = $_GET['status'] ?? '';
    
    if (empty($paymentID)) {
        header('Location: ' . APP_URL . '/checkout?payment=error&message=' . urlencode('Invalid callback'));
        exit();
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Find payment
    $stmt = $db->prepare("SELECT * FROM payments WHERE transaction_id = ?");
    $stmt->execute([$paymentID]);
    $payment = $stmt->fetch();
    
    if (!$payment) {
        header('Location: ' . APP_URL . '/checkout?payment=error&message=' . urlencode('Payment not found'));
        exit();
    }
    
    $gatewayResponse = json_decode($payment['gateway_response'], true);
    $idToken = $gatewayResponse['id_token'] ?? '';
    
    if ($status === 'success') {
        // Execute payment
        $executeResponse = file_get_contents(BKASH_BASE_URL . '/tokenized/checkout/execute', false, stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => [
                    'Content-Type: application/json',
                    'Accept: application/json',
                    'Authorization: ' . $idToken,
                    'X-APP-Key: ' . BKASH_APP_KEY,
                ],
                'content' => json_encode(['paymentID' => $paymentID]),
            ],
        ]));
        
        $executeData = json_decode($executeResponse, true);
        
        if (isset($executeData['statusCode']) && $executeData['statusCode'] === '0000') {
            // Update payment status
            $stmt = $db->prepare("UPDATE payments SET status = 'completed', verified_at = NOW() WHERE id = ?");
            $stmt->execute([$payment['id']]);
            
            // Create enrollment
            $stmt = $db->prepare("INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)");
            $stmt->execute([$payment['user_id'], $payment['course_id']]);
            
            // Update course student count
            $stmt = $db->prepare("UPDATE courses SET total_students = total_students + 1 WHERE id = ?");
            $stmt->execute([$payment['course_id']]);
            
            // Create notification
            $stmt = $db->prepare("SELECT title FROM courses WHERE id = ?");
            $stmt->execute([$payment['course_id']]);
            $course = $stmt->fetch();
            
            $stmt = $db->prepare("INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, 'enrollment', '/dashboard')");
            $stmt->execute([
                $payment['user_id'],
                'এনরোলমেন্ট সফল!',
                "আপনি সফলভাবে \"{$course['title']}\" কোর্সে এনরোল হয়েছেন।",
            ]);
            
            header('Location: ' . APP_URL . '/dashboard?payment=success');
            exit();
        }
    }
    
    // Payment failed or cancelled
    $stmt = $db->prepare("UPDATE payments SET status = 'failed' WHERE id = ?");
    $stmt->execute([$payment['id']]);
    
    header('Location: ' . APP_URL . '/checkout/' . $payment['course_id'] . '?payment=error&message=' . urlencode('পেমেন্ট ব্যর্থ হয়েছে'));
    exit();
}

function handleVerifyPayment(): void {
    $user = requireAdmin();
    $input = getJsonInput();
    
    if (!isset($input['payment_id']) || !isset($input['action'])) {
        jsonResponse(['error' => 'payment_id এবং action প্রয়োজন'], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Get payment
    $stmt = $db->prepare("SELECT * FROM payments WHERE id = ?");
    $stmt->execute([$input['payment_id']]);
    $payment = $stmt->fetch();
    
    if (!$payment) {
        jsonResponse(['error' => 'পেমেন্ট পাওয়া যায়নি'], 404);
    }
    
    if ($input['action'] === 'approve') {
        $db->beginTransaction();
        
        try {
            // Update payment status
            $stmt = $db->prepare("UPDATE payments SET status = 'completed', verified_at = NOW() WHERE id = ?");
            $stmt->execute([$payment['id']]);
            
            // Create enrollment
            $stmt = $db->prepare("INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)");
            $stmt->execute([$payment['user_id'], $payment['course_id']]);
            
            // Update course student count
            $stmt = $db->prepare("UPDATE courses SET total_students = total_students + 1 WHERE id = ?");
            $stmt->execute([$payment['course_id']]);
            
            // Create notification
            $stmt = $db->prepare("SELECT title FROM courses WHERE id = ?");
            $stmt->execute([$payment['course_id']]);
            $course = $stmt->fetch();
            
            $stmt = $db->prepare("INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, 'enrollment', '/dashboard')");
            $stmt->execute([
                $payment['user_id'],
                'পেমেন্ট অনুমোদিত!',
                "আপনার \"{$course['title']}\" কোর্সের পেমেন্ট অনুমোদিত হয়েছে। এখন কোর্স শুরু করতে পারেন!",
            ]);
            
            $db->commit();
            
            jsonResponse(['success' => true, 'message' => 'পেমেন্ট অনুমোদিত এবং এনরোলমেন্ট সম্পন্ন']);
            
        } catch (Exception $e) {
            $db->rollBack();
            jsonResponse(['error' => 'পেমেন্ট অনুমোদন করতে সমস্যা হয়েছে'], 500);
        }
        
    } elseif ($input['action'] === 'reject') {
        $stmt = $db->prepare("UPDATE payments SET status = 'failed' WHERE id = ?");
        $stmt->execute([$payment['id']]);
        
        // Create notification
        $stmt = $db->prepare("SELECT title FROM courses WHERE id = ?");
        $stmt->execute([$payment['course_id']]);
        $course = $stmt->fetch();
        
        $stmt = $db->prepare("INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, 'payment', '/dashboard/payments')");
        $stmt->execute([
            $payment['user_id'],
            'পেমেন্ট প্রত্যাখ্যাত',
            "আপনার \"{$course['title']}\" কোর্সের পেমেন্ট প্রত্যাখ্যান করা হয়েছে। সমস্যা থাকলে যোগাযোগ করুন।",
        ]);
        
        jsonResponse(['success' => true, 'message' => 'পেমেন্ট প্রত্যাখ্যাত']);
    } else {
        jsonResponse(['error' => 'Invalid action'], 400);
    }
}
