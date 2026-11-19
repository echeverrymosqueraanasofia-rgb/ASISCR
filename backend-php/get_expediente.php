<?php
require_once __DIR__ . '/db.php';

$documento = isset($_GET['documento']) ? trim($_GET['documento']) : '';
$mes = isset($_GET['mes']) ? str_pad(intval($_GET['mes']), 2, '0', STR_PAD_LEFT) : date('m');
$anio = isset($_GET['anio']) ? intval($_GET['anio']) : date('Y');

if (empty($documento)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Documento del estudiante requerido"]);
    exit();
}

try {
    // 1. Consultar estudiante
    $stmtEst = $pdo->prepare("SELECT id, nombre, grado as grado_id, documento FROM estudiantes WHERE documento = :doc LIMIT 1");
    $stmtEst->execute([':doc' => $documento]);
    $estudiante = $stmtEst->fetch();

    if (!$estudiante) {
        echo json_encode(["success" => false, "message" => "Estudiante no encontrado en la base de datos"]);
        exit();
    }

    // 2. Consultar asistencias del mes
    $fechaPrefijo = "$anio-$mes";
    $stmtAst = $pdo->prepare("
        SELECT id, estudiante_id, materia_id, fecha, estado, registrado_por, observaciones 
        FROM asistencias 
        WHERE estudiante_id = :est_id AND fecha LIKE :prefijo
        ORDER BY fecha ASC
    ");
    $stmtAst->execute([
        ':est_id' => $estudiante['id'],
        ':prefijo' => "$fechaPrefijo%"
    ]);
    $asistencias = $stmtAst->fetchAll();

    echo json_encode([
        "success" => true,
        "estudiante" => $estudiante,
        "asistencias" => $asistencias
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al consultar expediente: " . $e->getMessage()]);
}
