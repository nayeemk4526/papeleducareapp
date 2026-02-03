<?php
/**
 * Teachers API Endpoints
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet();
        break;
    case 'POST':
        handleCreate();
        break;
    case 'PUT':
        handleUpdate();
        break;
    case 'DELETE':
        handleDelete();
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function handleGet(): void {
    $db = Database::getInstance()->getConnection();
    
    if (isset($_GET['id'])) {
        $stmt = $db->prepare("SELECT * FROM teachers WHERE id = ? AND is_active = 1");
        $stmt->execute([$_GET['id']]);
        $teacher = $stmt->fetch();
        
        if (!$teacher) {
            jsonResponse(['error' => 'শিক্ষক পাওয়া যায়নি'], 404);
        }
        
        // Get courses by this teacher
        $stmt = $db->prepare("
            SELECT * FROM courses 
            WHERE instructor_id = ? AND is_published = 1 
            ORDER BY created_at DESC
        ");
        $stmt->execute([$teacher['id']]);
        $teacher['courses'] = $stmt->fetchAll();
        
        jsonResponse($teacher);
    }
    
    $stmt = $db->prepare("SELECT * FROM teachers WHERE is_active = 1 ORDER BY created_at ASC");
    $stmt->execute();
    $teachers = $stmt->fetchAll();
    
    jsonResponse(['data' => $teachers]);
}

function handleCreate(): void {
    $user = requireAdmin();
    $input = getJsonInput();
    
    $error = validateRequired($input, ['name']);
    if ($error) {
        jsonResponse(['error' => $error], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        INSERT INTO teachers (user_id, name, title, subtitle, bio, avatar_url, email, phone, specializations, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $input['user_id'] ?? null,
        $input['name'],
        $input['title'] ?? null,
        $input['subtitle'] ?? null,
        $input['bio'] ?? null,
        $input['avatar_url'] ?? null,
        $input['email'] ?? null,
        $input['phone'] ?? null,
        isset($input['specializations']) ? json_encode($input['specializations']) : null,
        $input['is_active'] ?? 1,
    ]);
    
    $teacherId = $db->lastInsertId();
    
    $stmt = $db->prepare("SELECT * FROM teachers WHERE id = ?");
    $stmt->execute([$teacherId]);
    $teacher = $stmt->fetch();
    
    jsonResponse(['success' => true, 'data' => $teacher, 'message' => 'শিক্ষক সফলভাবে যুক্ত হয়েছে'], 201);
}

function handleUpdate(): void {
    $user = requireAdmin();
    
    if (!isset($_GET['id'])) {
        jsonResponse(['error' => 'Teacher ID required'], 400);
    }
    
    $input = getJsonInput();
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("SELECT id FROM teachers WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'শিক্ষক পাওয়া যায়নি'], 404);
    }
    
    $fields = ['user_id', 'name', 'title', 'subtitle', 'bio', 'avatar_url', 'email', 'phone', 'is_active'];
    $updates = [];
    $params = [];
    
    foreach ($fields as $field) {
        if (array_key_exists($field, $input)) {
            $updates[] = "$field = ?";
            $params[] = $input[$field] === '' ? null : $input[$field];
        }
    }
    
    if (array_key_exists('specializations', $input)) {
        $updates[] = "specializations = ?";
        $params[] = json_encode($input['specializations']);
    }
    
    if (empty($updates)) {
        jsonResponse(['error' => 'No fields to update'], 400);
    }
    
    $params[] = $_GET['id'];
    $sql = "UPDATE teachers SET " . implode(', ', $updates) . " WHERE id = ?";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    $stmt = $db->prepare("SELECT * FROM teachers WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    $teacher = $stmt->fetch();
    
    jsonResponse(['success' => true, 'data' => $teacher, 'message' => 'শিক্ষক সফলভাবে আপডেট হয়েছে']);
}

function handleDelete(): void {
    $user = requireAdmin();
    
    if (!isset($_GET['id'])) {
        jsonResponse(['error' => 'Teacher ID required'], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("DELETE FROM teachers WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    
    if ($stmt->rowCount() === 0) {
        jsonResponse(['error' => 'শিক্ষক পাওয়া যায়নি'], 404);
    }
    
    jsonResponse(['success' => true, 'message' => 'শিক্ষক সফলভাবে মুছে ফেলা হয়েছে']);
}
