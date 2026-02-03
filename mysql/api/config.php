<?php
/**
 * Papel Educare API Configuration
 * MySQL Database Connection
 */

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'papel_educare');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
define('DB_CHARSET', 'utf8mb4');

// JWT Configuration
define('JWT_SECRET', 'your-super-secret-jwt-key-change-this-in-production');
define('JWT_EXPIRY', 86400 * 7); // 7 days

// bKash Configuration
define('BKASH_APP_KEY', '');
define('BKASH_APP_SECRET', '');
define('BKASH_USERNAME', '');
define('BKASH_PASSWORD', '');
define('BKASH_BASE_URL', 'https://tokenized.pay.bka.sh/v1.2.0-beta');

// SMS Configuration
define('SMS_API_KEY', '');
define('SMS_SENDER_ID', '');

// App Configuration
define('APP_URL', 'https://papeleducareapp.lovable.app');
define('API_URL', 'https://your-api-domain.com');

/**
 * Database Connection Class
 */
class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit();
        }
    }

    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection(): PDO {
        return $this->connection;
    }
}

/**
 * JWT Helper Functions
 */
function base64UrlEncode($data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

function generateJWT(array $payload): string {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRY;
    
    $base64Header = base64UrlEncode($header);
    $base64Payload = base64UrlEncode(json_encode($payload));
    
    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    $base64Signature = base64UrlEncode($signature);
    
    return "$base64Header.$base64Payload.$base64Signature";
}

function verifyJWT(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }
    
    [$base64Header, $base64Payload, $base64Signature] = $parts;
    
    $signature = base64UrlDecode($base64Signature);
    $expectedSignature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    
    if (!hash_equals($signature, $expectedSignature)) {
        return null;
    }
    
    $payload = json_decode(base64UrlDecode($base64Payload), true);
    
    if ($payload['exp'] < time()) {
        return null;
    }
    
    return $payload;
}

/**
 * Get authenticated user from JWT token
 */
function getAuthUser(): ?array {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (!preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
        return null;
    }
    
    return verifyJWT($matches[1]);
}

/**
 * Require authentication
 */
function requireAuth(): array {
    $user = getAuthUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'অনুগ্রহ করে লগইন করুন']);
        exit();
    }
    return $user;
}

/**
 * Check if user has role
 */
function hasRole(int $userId, string $role): bool {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT 1 FROM user_roles WHERE user_id = ? AND role = ?");
    $stmt->execute([$userId, $role]);
    return $stmt->fetchColumn() !== false;
}

/**
 * Require admin role
 */
function requireAdmin(): array {
    $user = requireAuth();
    if (!hasRole($user['user_id'], 'admin')) {
        http_response_code(403);
        echo json_encode(['error' => 'এডমিন অ্যাক্সেস প্রয়োজন']);
        exit();
    }
    return $user;
}

/**
 * Check if user is enrolled in course
 */
function isEnrolled(int $userId, int $courseId): bool {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT 1 FROM enrollments WHERE user_id = ? AND course_id = ?");
    $stmt->execute([$userId, $courseId]);
    return $stmt->fetchColumn() !== false;
}

/**
 * Get JSON input
 */
function getJsonInput(): array {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?? [];
}

/**
 * Send JSON response
 */
function jsonResponse($data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Validate required fields
 */
function validateRequired(array $data, array $fields): ?string {
    foreach ($fields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            return "'{$field}' ফিল্ড প্রয়োজন";
        }
    }
    return null;
}
