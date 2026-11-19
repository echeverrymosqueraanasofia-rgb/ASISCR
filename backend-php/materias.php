<?php
require_once __DIR__ . '/db.php';

$grado = isset($_GET['grado_id']) ? trim($_GET['grado_id']) : '';

try {
    if (!empty($grado) && $grado !== 'todas') {
        $stmt = $pdo->prepare("SELECT id, nombre, grado_id, docente_id FROM materias WHERE grado_id = :gid ORDER BY nombre ASC");
        $stmt->execute([':gid' => $grado]);
    } else {
        $stmt = $pdo->query("SELECT id, nombre, grado_id, docente_id FROM materias ORDER BY nombre ASC");
    }
    $materias = $stmt->fetchAll();
    echo json_encode(["success" => true, "data" => $materias]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
