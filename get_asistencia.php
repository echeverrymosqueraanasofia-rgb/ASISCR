<?php
// ==============================================================================
// ASISCR - ENDPOINT PARA CONSULTAR ASISTENCIAS POR MATERIA Y FECHA
// ==============================================================================
require_once __DIR__ . '/db.php';

$materia_id = isset($_GET['materia_id']) ? trim($_GET['materia_id']) : '';
$fecha = isset($_GET['fecha']) ? trim($_GET['fecha']) : '';

try {
    $sql = 'SELECT a.id, a.estudiante_id, e.nombre AS estudiante_nombre, a.materia_id, a.fecha, a.estado, a.registrado_por, a.observaciones 
            FROM asistencias a 
            LEFT JOIN estudiantes e ON a.estudiante_id = e.id 
            WHERE 1=1';
    $params = [];

    if (!empty($materia_id)) {
        $sql .= ' AND a.materia_id = :materia_id';
        $params['materia_id'] = $materia_id;
    }

    if (!empty($fecha)) {
        $sql .= ' AND a.fecha = :fecha';
        $params['fecha'] = $fecha;
    }

    $sql .= ' ORDER BY e.nombre ASC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'count' => count($rows),
        'asistencias' => $rows
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener asistencias: ' . $e->getMessage()
    ]);
}
