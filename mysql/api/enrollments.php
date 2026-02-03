<?php
/**
 * Enrollments API Endpoints
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'check') {
            handleCheck();
        } else {
            handleGet();
        }
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function handleGet(): void {
    $user = requireAuth();
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        SELECT e.*, 
               c.title as course_title, c.slug as course_slug,
               c.thumbnail_url as course_thumbnail, c.total_lessons,
               t.name as instructor_name
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN teachers t ON c.instructor_id = t.id
        WHERE e.user_id = ?
        ORDER BY e.enrolled_at DESC
    ");
    $stmt->execute([$user['user_id']]);
    $enrollments = $stmt->fetchAll();
    
    // Get progress for each enrollment
    foreach ($enrollments as &$enrollment) {
        $stmt = $db->prepare("
            SELECT COUNT(*) as completed 
            FROM lesson_progress 
            WHERE user_id = ? AND lesson_id IN (
                SELECT id FROM lessons WHERE course_id = ?
            ) AND is_completed = 1
        ");
        $stmt->execute([$user['user_id'], $enrollment['course_id']]);
        $progress = $stmt->fetch();
        $enrollment['completed_lessons'] = $progress['completed'];
    }
    
    jsonResponse(['data' => $enrollments]);
}

function handleCheck(): void {
    $user = requireAuth();
    
    if (!isset($_GET['course_id'])) {
        jsonResponse(['error' => 'course_id required'], 400);
    }
    
    $enrolled = isEnrolled($user['user_id'], $_GET['course_id']);
    jsonResponse(['enrolled' => $enrolled]);
}
