<?php
// ==============================================================================
// ASISCR - ENDPOINT PARA REGISTRAR ASISTENCIA (save_asistencia.php)
// ==============================================================================
require_once __DIR__ . '/db.php';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || !isset($data['materia_id']) || !isset($data['fecha']) || !isset($data['registros'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Faltan campos obligatorios: materia_id, fecha o registros.'
    ]);
    exit();
}

$materia_id = trim($data['materia_id']);
$fecha = trim($data['fecha']);
$registrado_por = isset($data['registrado_por']) ? trim($data['registrado_por']) : 'Docente';
$registros = $data['registros'];

if (!is_array($registros) || empty($registros)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'La lista de registros está vacía o no tiene formato válido.'
    ]);
    exit();
}

try {
    // Iniciar transacción para garantizar consistencia atómica
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('
        INSERT INTO asistencias (estudiante_id, materia_id, fecha, estado, registrado_por, observaciones)
        VALUES (:estudiante_id, :materia_id, :fecha, :estado, :registrado_por, :observaciones)
        ON DUPLICATE KEY UPDATE 
            estado = VALUES(estado),
            registrado_por = VALUES(registrado_por),
            observaciones = VALUES(observaciones),
            actualizado_en = CURRENT_TIMESTAMP
    ');

    foreach ($registros as $reg) {
        if (!isset($reg['estudiante_id']) || !isset($reg['estado'])) {
            continue;
        }

        $stmt->execute([
            'estudiante_id' => $reg['estudiante_id'],
            'materia_id'    => $materia_id,
            'fecha'         => $fecha,
            'estado'        => $reg['estado'],
            'registrado_por'=> $registrado_por,
            'observaciones' => isset($reg['observaciones']) ? $reg['observaciones'] : null
        ]);
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Asistencias guardadas exitosamente en la base de datos MySQL',
        'count'   => count($registros)
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al guardar asistencias: ' . $e->getMessage()
    ]);
}
