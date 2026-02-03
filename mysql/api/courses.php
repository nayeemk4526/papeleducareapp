<?php
/**
 * Courses API Endpoints
 * - GET /courses.php - List all published courses
 * - GET /courses.php?id=1 - Get course by ID
 * - GET /courses.php?slug=course-slug - Get course by slug
 * - GET /courses.php?category_id=1 - Get courses by category
 * - POST /courses.php - Create course (admin only)
 * - PUT /courses.php?id=1 - Update course (admin only)
 * - DELETE /courses.php?id=1 - Delete course (admin only)
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
    
    // Get single course by ID
    if (isset($_GET['id'])) {
        $stmt = $db->prepare("
            SELECT c.*, 
                   cat.id as category_id, cat.name as category_name,
                   t.id as instructor_id, t.name as instructor_name, t.avatar_url as instructor_avatar,
                   t.title as instructor_title, t.bio as instructor_bio
            FROM courses c
            LEFT JOIN categories cat ON c.category_id = cat.id
            LEFT JOIN teachers t ON c.instructor_id = t.id
            WHERE c.id = ? AND c.is_published = 1
        ");
        $stmt->execute([$_GET['id']]);
        $course = $stmt->fetch();
        
        if (!$course) {
            jsonResponse(['error' => 'কোর্স পাওয়া যায়নি'], 404);
        }
        
        // Get learning outcomes
        $stmt = $db->prepare("SELECT * FROM course_learning_outcomes WHERE course_id = ? ORDER BY display_order");
        $stmt->execute([$course['id']]);
        $course['learning_outcomes'] = $stmt->fetchAll();
        
        // Get sections with lessons
        $stmt = $db->prepare("SELECT * FROM sections WHERE course_id = ? AND is_published = 1 ORDER BY section_order");
        $stmt->execute([$course['id']]);
        $sections = $stmt->fetchAll();
        
        foreach ($sections as &$section) {
            $stmt = $db->prepare("SELECT * FROM lessons WHERE section_id = ? AND is_published = 1 ORDER BY lesson_order");
            $stmt->execute([$section['id']]);
            $section['lessons'] = $stmt->fetchAll();
        }
        $course['sections'] = $sections;
        
        jsonResponse($course);
    }
    
    // Get single course by slug
    if (isset($_GET['slug'])) {
        $stmt = $db->prepare("
            SELECT c.*, 
                   cat.id as category_id, cat.name as category_name,
                   t.id as instructor_id, t.name as instructor_name, t.avatar_url as instructor_avatar,
                   t.title as instructor_title, t.bio as instructor_bio
            FROM courses c
            LEFT JOIN categories cat ON c.category_id = cat.id
            LEFT JOIN teachers t ON c.instructor_id = t.id
            WHERE c.slug = ? AND c.is_published = 1
        ");
        $stmt->execute([$_GET['slug']]);
        $course = $stmt->fetch();
        
        if (!$course) {
            jsonResponse(['error' => 'কোর্স পাওয়া যায়নি'], 404);
        }
        
        // Get learning outcomes
        $stmt = $db->prepare("SELECT * FROM course_learning_outcomes WHERE course_id = ? ORDER BY display_order");
        $stmt->execute([$course['id']]);
        $course['learning_outcomes'] = $stmt->fetchAll();
        
        // Get sections with lessons
        $stmt = $db->prepare("SELECT * FROM sections WHERE course_id = ? AND is_published = 1 ORDER BY section_order");
        $stmt->execute([$course['id']]);
        $sections = $stmt->fetchAll();
        
        foreach ($sections as &$section) {
            $stmt = $db->prepare("SELECT * FROM lessons WHERE section_id = ? AND is_published = 1 ORDER BY lesson_order");
            $stmt->execute([$section['id']]);
            $section['lessons'] = $stmt->fetchAll();
        }
        $course['sections'] = $sections;
        
        jsonResponse($course);
    }
    
    // Build query for listing courses
    $sql = "
        SELECT c.*, 
               cat.id as category_id, cat.name as category_name,
               t.id as instructor_id, t.name as instructor_name, t.avatar_url as instructor_avatar
        FROM courses c
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN teachers t ON c.instructor_id = t.id
        WHERE c.is_published = 1
    ";
    $params = [];
    
    // Filter by category
    if (isset($_GET['category_id'])) {
        $sql .= " AND c.category_id = ?";
        $params[] = $_GET['category_id'];
    }
    
    // Filter by featured
    if (isset($_GET['featured']) && $_GET['featured'] === '1') {
        $sql .= " AND c.is_featured = 1";
    }
    
    // Search
    if (isset($_GET['search']) && !empty($_GET['search'])) {
        $sql .= " AND (c.title LIKE ? OR c.description LIKE ?)";
        $searchTerm = '%' . $_GET['search'] . '%';
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    $sql .= " ORDER BY c.created_at DESC";
    
    // Pagination
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = max(1, min(100, intval($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    $sql .= " LIMIT $limit OFFSET $offset";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $courses = $stmt->fetchAll();
    
    // Get total count
    $countSql = "SELECT COUNT(*) FROM courses c WHERE c.is_published = 1";
    $countParams = [];
    
    if (isset($_GET['category_id'])) {
        $countSql .= " AND c.category_id = ?";
        $countParams[] = $_GET['category_id'];
    }
    if (isset($_GET['featured']) && $_GET['featured'] === '1') {
        $countSql .= " AND c.is_featured = 1";
    }
    
    $stmt = $db->prepare($countSql);
    $stmt->execute($countParams);
    $total = $stmt->fetchColumn();
    
    jsonResponse([
        'data' => $courses,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'total_pages' => ceil($total / $limit),
        ]
    ]);
}

function handleCreate(): void {
    $user = requireAdmin();
    $input = getJsonInput();
    
    $error = validateRequired($input, ['title', 'slug', 'price']);
    if ($error) {
        jsonResponse(['error' => $error], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Check if slug already exists
    $stmt = $db->prepare("SELECT id FROM courses WHERE slug = ?");
    $stmt->execute([$input['slug']]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'এই স্লাগ আগে থেকেই ব্যবহৃত'], 400);
    }
    
    $stmt = $db->prepare("
        INSERT INTO courses (
            title, slug, description, short_description, price, discount_price,
            category_id, instructor_id, duration_hours, total_lessons,
            thumbnail_url, preview_video_url, how_to_enroll_video_url,
            is_published, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $input['title'],
        $input['slug'],
        $input['description'] ?? null,
        $input['short_description'] ?? null,
        $input['price'],
        $input['discount_price'] ?? null,
        $input['category_id'] ?? null,
        $input['instructor_id'] ?? null,
        $input['duration_hours'] ?? null,
        $input['total_lessons'] ?? 0,
        $input['thumbnail_url'] ?? null,
        $input['preview_video_url'] ?? null,
        $input['how_to_enroll_video_url'] ?? null,
        $input['is_published'] ?? 0,
        $input['is_featured'] ?? 0,
    ]);
    
    $courseId = $db->lastInsertId();
    
    // Get created course
    $stmt = $db->prepare("SELECT * FROM courses WHERE id = ?");
    $stmt->execute([$courseId]);
    $course = $stmt->fetch();
    
    jsonResponse(['success' => true, 'data' => $course, 'message' => 'কোর্স সফলভাবে তৈরি হয়েছে'], 201);
}

function handleUpdate(): void {
    $user = requireAdmin();
    
    if (!isset($_GET['id'])) {
        jsonResponse(['error' => 'Course ID required'], 400);
    }
    
    $input = getJsonInput();
    $db = Database::getInstance()->getConnection();
    
    // Check if course exists
    $stmt = $db->prepare("SELECT id FROM courses WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'কোর্স পাওয়া যায়নি'], 404);
    }
    
    // Build update query dynamically
    $fields = ['title', 'slug', 'description', 'short_description', 'price', 'discount_price',
               'category_id', 'instructor_id', 'duration_hours', 'total_lessons',
               'thumbnail_url', 'preview_video_url', 'how_to_enroll_video_url',
               'is_published', 'is_featured'];
    
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
    $sql = "UPDATE courses SET " . implode(', ', $updates) . " WHERE id = ?";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    // Get updated course
    $stmt = $db->prepare("SELECT * FROM courses WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    $course = $stmt->fetch();
    
    jsonResponse(['success' => true, 'data' => $course, 'message' => 'কোর্স সফলভাবে আপডেট হয়েছে']);
}

function handleDelete(): void {
    $user = requireAdmin();
    
    if (!isset($_GET['id'])) {
        jsonResponse(['error' => 'Course ID required'], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("DELETE FROM courses WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    
    if ($stmt->rowCount() === 0) {
        jsonResponse(['error' => 'কোর্স পাওয়া যায়নি'], 404);
    }
    
    jsonResponse(['success' => true, 'message' => 'কোর্স সফলভাবে মুছে ফেলা হয়েছে']);
}
