<?php
require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true);

$materia_id = isset($input['materia_id']) ? trim($input['materia_id']) : '';
$fecha = isset($input['fecha']) ? trim($input['fecha']) : '';
$registrado_por = isset($input['registrado_por']) ? trim($input['registrado_por']) : 'Docente';
$registros = isset($input['registros']) && is_array($input['registros']) ? $input['registros'] : [];

if (empty($materia_id) || empty($fecha) || empty($registros)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datos incompletos para guardar asistencia"]);
    exit();
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO asistencias (estudiante_id, materia_id, fecha, estado, registrado_por, observaciones)
        VALUES (:est_id, :mat_id, :fecha, :estado, :reg_por, :obs)
        ON DUPLICATE KEY UPDATE 
            estado = VALUES(estado),
            registrado_por = VALUES(registrado_por),
            observaciones = VALUES(observaciones)
    ");

    foreach ($registros as $r) {
        $estudiante_id = isset($r['estudiante_id']) ? $r['estudiante_id'] : '';
        $estado = isset($r['estado']) ? $r['estado'] : 'Presente';
        $observaciones = isset($r['observaciones']) ? $r['observaciones'] : null;

        if (!empty($estudiante_id)) {
            $stmt->execute([
                ':est_id' => $estudiante_id,
                ':mat_id' => $materia_id,
                ':fecha' => $fecha,
                ':estado' => $estado,
                ':reg_por' => $registrado_por,
                ':obs' => $observaciones
            ]);
        }
    }

    $pdo->commit();
    echo json_encode(["success" => true, "message" => "Asistencias registradas correctamente en MySQL"]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al guardar en base de datos: " . $e->getMessage()]);
}
