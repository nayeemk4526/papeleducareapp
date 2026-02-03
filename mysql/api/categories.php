<?php
/**
 * Categories API Endpoints
 * - GET /categories.php - List all published categories
 * - GET /categories.php?id=1 - Get category by ID
 * - GET /categories.php?slug=category-slug - Get category by slug
 * - POST /categories.php - Create category (admin only)
 * - PUT /categories.php?id=1 - Update category (admin only)
 * - DELETE /categories.php?id=1 - Delete category (admin only)
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
    
    // Get single category by ID
    if (isset($_GET['id'])) {
        $stmt = $db->prepare("SELECT * FROM categories WHERE id = ? AND is_published = 1");
        $stmt->execute([$_GET['id']]);
        $category = $stmt->fetch();
        
        if (!$category) {
            jsonResponse(['error' => 'ক্যাটাগরি পাওয়া যায়নি'], 404);
        }
        
        jsonResponse($category);
    }
    
    // Get single category by slug
    if (isset($_GET['slug'])) {
        $stmt = $db->prepare("SELECT * FROM categories WHERE slug = ? AND is_published = 1");
        $stmt->execute([$_GET['slug']]);
        $category = $stmt->fetch();
        
        if (!$category) {
            jsonResponse(['error' => 'ক্যাটাগরি পাওয়া যায়নি'], 404);
        }
        
        // Get courses in this category
        $stmt = $db->prepare("
            SELECT c.*, t.name as instructor_name, t.avatar_url as instructor_avatar
            FROM courses c
            LEFT JOIN teachers t ON c.instructor_id = t.id
            WHERE c.category_id = ? AND c.is_published = 1
            ORDER BY c.created_at DESC
        ");
        $stmt->execute([$category['id']]);
        $category['courses'] = $stmt->fetchAll();
        
        jsonResponse($category);
    }
    
    // List all published categories
    $stmt = $db->prepare("SELECT * FROM categories WHERE is_published = 1 ORDER BY display_order ASC");
    $stmt->execute();
    $categories = $stmt->fetchAll();
    
    jsonResponse(['data' => $categories]);
}

function handleCreate(): void {
    $user = requireAdmin();
    $input = getJsonInput();
    
    $error = validateRequired($input, ['name', 'slug']);
    if ($error) {
        jsonResponse(['error' => $error], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Check if slug already exists
    $stmt = $db->prepare("SELECT id FROM categories WHERE slug = ?");
    $stmt->execute([$input['slug']]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'এই স্লাগ আগে থেকেই ব্যবহৃত'], 400);
    }
    
    $stmt = $db->prepare("
        INSERT INTO categories (name, slug, description, icon_name, image_url, is_published, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $input['name'],
        $input['slug'],
        $input['description'] ?? null,
        $input['icon_name'] ?? null,
        $input['image_url'] ?? null,
        $input['is_published'] ?? 1,
        $input['display_order'] ?? 0,
    ]);
    
    $categoryId = $db->lastInsertId();
    
    $stmt = $db->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$categoryId]);
    $category = $stmt->fetch();
    
    jsonResponse(['success' => true, 'data' => $category, 'message' => 'ক্যাটাগরি সফলভাবে তৈরি হয়েছে'], 201);
}

function handleUpdate(): void {
    $user = requireAdmin();
    
    if (!isset($_GET['id'])) {
        jsonResponse(['error' => 'Category ID required'], 400);
    }
    
    $input = getJsonInput();
    $db = Database::getInstance()->getConnection();
    
    // Check if category exists
    $stmt = $db->prepare("SELECT id FROM categories WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'ক্যাটাগরি পাওয়া যায়নি'], 404);
    }
    
    $fields = ['name', 'slug', 'description', 'icon_name', 'image_url', 'is_published', 'display_order'];
    $updates = [];
    $params = [];
    
    foreach ($fields as $field) {
        if (array_key_exists($field, $input)) {
            $updates[] = "$field = ?";
            $params[] = $input[$field] === '' ? null : $input[$field];
        }
    }
    
    if (empty($updates)) {
        jsonResponse(['error' => 'No fields to update'], 400);
    }
    
    $params[] = $_GET['id'];
    $sql = "UPDATE categories SET " . implode(', ', $updates) . " WHERE id = ?";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    $stmt = $db->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    $category = $stmt->fetch();
    
    jsonResponse(['success' => true, 'data' => $category, 'message' => 'ক্যাটাগরি সফলভাবে আপডেট হয়েছে']);
}

function handleDelete(): void {
    $user = requireAdmin();
    
    if (!isset($_GET['id'])) {
        jsonResponse(['error' => 'Category ID required'], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    
    if ($stmt->rowCount() === 0) {
        jsonResponse(['error' => 'ক্যাটাগরি পাওয়া যায়নি'], 404);
    }
    
    jsonResponse(['success' => true, 'message' => 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে']);
}
