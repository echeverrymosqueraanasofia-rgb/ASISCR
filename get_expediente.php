<?php
// ==============================================================================
// ASISCR - ENDPOINT PARA CONSULTAR EXPEDIENTE ESTUDIANTIL (get_expediente.php)
// ==============================================================================
require_once __DIR__ . '/db.php';

$documento = isset($_GET['documento']) ? trim($_GET['documento']) : '';
$mes = isset($_GET['mes']) ? (int)$_GET['mes'] : (int)date('m');
$anio = isset($_GET['anio']) ? (int)$_GET['anio'] : (int)date('Y');

if (empty($documento)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Se requiere el parámetro documento.'
    ]);
    exit();
}

try {
    // 1. Obtener la información del estudiante
    $stmtEst = $pdo->prepare('
        SELECT e.id, e.nombre, e.documento, g.nombre AS grado_nombre, e.grado_id
        FROM estudiantes e
        LEFT JOIN grados g ON e.grado_id = g.id
        WHERE e.documento = :documento
        LIMIT 1
    ');
    $stmtEst->execute(['documento' => $documento]);
    $estudiante = $stmtEst->fetch();

    if (!$estudiante) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'No se encontró estudiante con ese documento en el sistema.'
        ]);
        exit();
    }

    // 2. Obtener las asistencias del estudiante en el mes y año solicitado
    $mesStr = str_pad((string)$mes, 2, '0', STR_PAD_LEFT);
    $fechaInicio = "$anio-$mesStr-01";
    $fechaFin = date('Y-m-t', strtotime($fechaInicio));

    $stmtAsis = $pdo->prepare('
        SELECT a.id, a.estudiante_id, a.materia_id, m.nombre AS materia_nombre, 
               a.fecha, a.estado, a.registrado_por, a.observaciones
        FROM asistencias a
        LEFT JOIN materias m ON a.materia_id = m.id
        WHERE a.estudiante_id = :estudiante_id
          AND a.fecha BETWEEN :fechaInicio AND :fechaFin
        ORDER BY a.fecha ASC
    ');
    $stmtAsis->execute([
        'estudiante_id' => $estudiante['id'],
        'fechaInicio'   => $fechaInicio,
        'fechaFin'      => $fechaFin
    ]);
    $asistencias = $stmtAsis->fetchAll();

    echo json_encode([
        'success' => true,
        'estudiante' => [
            'id' => (string)$estudiante['id'],
            'nombre' => $estudiante['nombre'],
            'documento' => $estudiante['documento'],
            'grado_id' => $estudiante['grado_nombre'] ?: $estudiante['grado_id']
        ],
        'asistencias' => $asistencias
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al consultar expediente: ' . $e->getMessage()
    ]);
}
