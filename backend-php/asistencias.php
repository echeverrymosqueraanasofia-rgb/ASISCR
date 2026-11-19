<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $materia_id = isset($_GET['materia_id']) ? trim($_GET['materia_id']) : '';
    $fecha = isset($_GET['fecha']) ? trim($_GET['fecha']) : '';

    try {
        $sql = "SELECT id, estudiante_id, materia_id, fecha, estado, registrado_por, observaciones FROM asistencias WHERE 1=1";
        $params = [];

        if (!empty($materia_id) && $materia_id !== 'todas') {
            $sql .= " AND materia_id = :mat";
            $params[':mat'] = $materia_id;
        }
        if (!empty($fecha)) {
            $sql .= " AND fecha = :fec";
            $params[':fec'] = $fecha;
        }

        $sql .= " ORDER BY fecha DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $asistencias = $stmt->fetchAll();

        echo json_encode(["success" => true, "data" => $asistencias]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    // Reutilizar lógica de save_asistencia
    require_once __DIR__ . '/save_asistencia.php';
}
