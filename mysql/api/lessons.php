<?php
/**
 * Lessons API Endpoints
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        handleGet();
        break;
    case 'POST':
        if ($action === 'progress') {
            handleProgress();
        } else {
            handleCreate();
        }
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
    
    // Get single lesson
    if (isset($_GET['id'])) {
        $user = requireAuth();
        
        $stmt = $db->prepare("SELECT * FROM lessons WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        $lesson = $stmt->fetch();
        
        if (!$lesson) {
            jsonResponse(['error' => 'লেসন পাওয়া যায়নি'], 404);
        }
        
        // Check if user has access (enrolled or free preview)
        if (!$lesson['is_free_preview'] && !isEnrolled($user['user_id'], $lesson['course_id'])) {
            jsonResponse(['error' => 'এই লেসন দেখতে হলে কোর্সে এনরোল করতে হবে'], 403);
        }
        
        // Get progress
        $stmt = $db->prepare("SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?");
        $stmt->execute([$user['user_id'], $lesson['id']]);
        $lesson['progress'] = $stmt->fetch() ?: null;
        
        jsonResponse($lesson);
    }
    
    // Get lessons by course
    if (isset($_GET['course_id'])) {
        $stmt = $db->prepare("
            SELECT l.*, s.title as section_title, s.section_order
            FROM lessons l
            LEFT JOIN sections s ON l.section_id = s.id
            WHERE l.course_id = ? AND l.is_published = 1
            ORDER BY s.section_order, l.lesson_order
        ");
        $stmt->execute([$_GET['course_id']]);
        $lessons = $stmt->fetchAll();
        
        // If user is authenticated, get progress
        $user = getAuthUser();
        if ($user) {
            foreach ($lessons as &$lesson) {
                $stmt = $db->prepare("SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?");
                $stmt->execute([$user['user_id'], $lesson['id']]);
                $lesson['progress'] = $stmt->fetch() ?: null;
            }
        }
        
        jsonResponse(['data' => $lessons]);
    }
    
    jsonResponse(['error' => 'course_id or id required'], 400);
}

function handleProgress(): void {
    $user = requireAuth();
    
    if (!isset($_GET['lesson_id'])) {
        jsonResponse(['error' => 'lesson_id required'], 400);
    }
    
    $input = getJsonInput();
    $db = Database::getInstance()->getConnection();
    
    // Verify lesson exists and user is enrolled
    $stmt = $db->prepare("SELECT course_id FROM lessons WHERE id = ?");
    $stmt->execute([$_GET['lesson_id']]);
    $lesson = $stmt->fetch();
    
    if (!$lesson) {
        jsonResponse(['error' => 'লেসন পাওয়া যায়নি'], 404);
    }
    
    if (!isEnrolled($user['user_id'], $lesson['course_id'])) {
        jsonResponse(['error' => 'আপনি এই কোর্সে এনরোল করা নেই'], 403);
    }
    
    // Upsert progress
    $stmt = $db->prepare("
        INSERT INTO lesson_progress (user_id, lesson_id, is_completed, watch_time_seconds, completed_at)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            is_completed = VALUES(is_completed),
            watch_time_seconds = VALUES(watch_time_seconds),
            completed_at = VALUES(completed_at)
    ");
    
    $isCompleted = $input['is_completed'] ?? false;
    $watchTime = $input['watch_time_seconds'] ?? 0;
    $completedAt = $isCompleted ? date('Y-m-d H:i:s') : null;
    
    $stmt->execute([
        $user['user_id'],
        $_GET['lesson_id'],
        $isCompleted ? 1 : 0,
        $watchTime,
        $completedAt,
    ]);
    
    // Update enrollment last accessed
    $stmt = $db->prepare("UPDATE enrollments SET last_accessed_lesson_id = ? WHERE user_id = ? AND course_id = ?");
    $stmt->execute([$_GET['lesson_id'], $user['user_id'], $lesson['course_id']]);
    
    // Calculate and update overall progress
    $stmt = $db->prepare("SELECT COUNT(*) FROM lessons WHERE course_id = ? AND is_published = 1");
    $stmt->execute([$lesson['course_id']]);
    $totalLessons = $stmt->fetchColumn();
    
    $stmt = $db->prepare("
        SELECT COUNT(*) FROM lesson_progress 
        WHERE user_id = ? AND is_completed = 1 
        AND lesson_id IN (SELECT id FROM lessons WHERE course_id = ?)
    ");
    $stmt->execute([$user['user_id'], $lesson['course_id']]);
    $completedLessons = $stmt->fetchColumn();
    
    $progressPercentage = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100, 2) : 0;
    
    $stmt = $db->prepare("UPDATE enrollments SET progress_percentage = ? WHERE user_id = ? AND course_id = ?");
    $stmt->execute([$progressPercentage, $user['user_id'], $lesson['course_id']]);
    
    jsonResponse(['success' => true, 'progress_percentage' => $progressPercentage]);
}

function handleCreate(): void {
    $user = requireAdmin();
    $input = getJsonInput();
    
    $error = validateRequired($input, ['course_id', 'title']);
    if ($error) {
        jsonResponse(['error' => $error], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        INSERT INTO lessons (course_id, section_id, title, description, video_url, video_duration_minutes, materials_url, lesson_order, is_free_preview, is_published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $input['course_id'],
        $input['section_id'] ?? null,
        $input['title'],
        $input['description'] ?? null,
        $input['video_url'] ?? null,
        $input['video_duration_minutes'] ?? null,
        $input['materials_url'] ?? null,
        $input['lesson_order'] ?? 0,
        $input['is_free_preview'] ?? 0,
        $input['is_published'] ?? 1,
    ]);
    
    $lessonId = $db->lastInsertId();
    
    $stmt = $db->prepare("SELECT * FROM lessons WHERE id = ?");
    $stmt->execute([$lessonId]);
    $lesson = $stmt->fetch();
    
    jsonResponse(['success' => true, 'data' => $lesson, 'message' => 'লেসন সফলভাবে তৈরি হয়েছে'], 201);
}

function handleUpdate(): void {
    $user = requireAdmin();
    
    if (!isset($_GET['id'])) {
        jsonResponse(['error' => 'Lesson ID required'], 400);
    }
    
    $input = getJsonInput();
    $db = Database::getInstance()->getConnection();
    
    $fields = ['section_id', 'title', 'description', 'video_url', 'video_duration_minutes', 'materials_url', 'lesson_order', 'is_free_preview', 'is_published'];
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
    $sql = "UPDATE lessons SET " . implode(', ', $updates) . " WHERE id = ?";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    $stmt = $db->prepare("SELECT * FROM lessons WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    $lesson = $stmt->fetch();
    
    jsonResponse(['success' => true, 'data' => $lesson, 'message' => 'লেসন সফলভাবে আপডেট হয়েছে']);
}

function handleDelete(): void {
    $user = requireAdmin();
    
    if (!isset($_GET['id'])) {
        jsonResponse(['error' => 'Lesson ID required'], 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("DELETE FROM lessons WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    
    if ($stmt->rowCount() === 0) {
        jsonResponse(['error' => 'লেসন পাওয়া যায়নি'], 404);
    }
    
    jsonResponse(['success' => true, 'message' => 'লেসন সফলভাবে মুছে ফেলা হয়েছে']);
}
