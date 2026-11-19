<?php
// ==============================================================================
// ASISCR - ENDPOINT PARA OBTENER GRADOS (get_grados.php)
// ==============================================================================
require_once __DIR__ . '/db.php';

try {
    $stmt = $pdo->query('SELECT id, nombre, director_grupo FROM grados ORDER BY nombre ASC');
    $grados = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'grados'  => $grados
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener grados: ' . $e->getMessage()
    ]);
}
