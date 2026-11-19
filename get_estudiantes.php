<?php
// ==============================================================================
// ASISCR - ENDPOINT PARA OBTENER ESTUDIANTES (get_estudiantes.php)
// ==============================================================================
require_once __DIR__ . '/db.php';

$grado_id = isset($_GET['grado_id']) ? trim($_GET['grado_id']) : '';

try {
    if (!empty($grado_id)) {
        $stmt = $pdo->prepare('SELECT id, nombre, documento, grado_id FROM estudiantes WHERE grado_id = :grado_id ORDER BY nombre ASC');
        $stmt->execute(['grado_id' => $grado_id]);
    } else {
        $stmt = $pdo->query('SELECT id, nombre, documento, grado_id FROM estudiantes ORDER BY nombre ASC');
    }
    
    $estudiantes = $stmt->fetchAll();

    echo json_encode([
        'success'     => true,
        'estudiantes' => $estudiantes
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener estudiantes: ' . $e->getMessage()
    ]);
}
