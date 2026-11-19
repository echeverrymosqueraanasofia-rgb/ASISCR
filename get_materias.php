<?php
// ==============================================================================
// ASISCR - ENDPOINT PARA OBTENER MATERIAS (get_materias.php)
// ==============================================================================
require_once __DIR__ . '/db.php';

$grado_id = isset($_GET['grado_id']) ? trim($_GET['grado_id']) : '';

try {
    if (!empty($grado_id)) {
        $stmt = $pdo->prepare('SELECT id, nombre, grado_id, docente_id FROM materias WHERE grado_id = :grado_id ORDER BY nombre ASC');
        $stmt->execute(['grado_id' => $grado_id]);
    } else {
        $stmt = $pdo->query('SELECT id, nombre, grado_id, docente_id FROM materias ORDER BY nombre ASC');
    }
    
    $materias = $stmt->fetchAll();

    echo json_encode([
        'success'  => true,
        'materias' => $materias
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener materias: ' . $e->getMessage()
    ]);
}
