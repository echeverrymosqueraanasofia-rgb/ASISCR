<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $grado = isset($_GET['grado_id']) ? trim($_GET['grado_id']) : '';

    try {
        if (!empty($grado) && $grado !== 'todos') {
            $stmt = $pdo->prepare("SELECT id, grado_id, grado_nombre, dia, hora_inicio, hora_fin, materia_nombre, docente_nombre, aula FROM horarios WHERE grado_id = :gid OR grado_nombre = :gnom ORDER BY dia, hora_inicio ASC");
            $stmt->execute([':gid' => $grado, ':gnom' => $grado]);
        } else {
            $stmt = $pdo->query("SELECT id, grado_id, grado_nombre, dia, hora_inicio, hora_fin, materia_nombre, docente_nombre, aula FROM horarios ORDER BY dia, hora_inicio ASC");
        }
        $horarios = $stmt->fetchAll();
        echo json_encode(["success" => true, "data" => $horarios]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $id = isset($input['id']) ? $input['id'] : 'hor_' . time();
    $grado_id = isset($input['grado_id']) ? trim($input['grado_id']) : 'gr_11a';
    $grado_nombre = isset($input['grado_nombre']) ? trim($input['grado_nombre']) : '11-A';
    $dia = isset($input['dia']) ? trim($input['dia']) : 'Lunes';
    $hora_inicio = isset($input['hora_inicio']) ? trim($input['hora_inicio']) : '07:00';
    $hora_fin = isset($input['hora_fin']) ? trim($input['hora_fin']) : '08:30';
    $materia_nombre = isset($input['materia_nombre']) ? trim($input['materia_nombre']) : '';
    $docente_nombre = isset($input['docente_nombre']) ? trim($input['docente_nombre']) : '';
    $aula = isset($input['aula']) ? trim($input['aula']) : 'Salón 201';

    try {
        $stmt = $pdo->prepare("
            INSERT INTO horarios (id, grado_id, grado_nombre, dia, hora_inicio, hora_fin, materia_nombre, docente_nombre, aula)
            VALUES (:id, :gid, :gnom, :dia, :hi, :hf, :mat, :doc, :aula)
            ON DUPLICATE KEY UPDATE
                grado_id = VALUES(grado_id),
                grado_nombre = VALUES(grado_nombre),
                dia = VALUES(dia),
                hora_inicio = VALUES(hora_inicio),
                hora_fin = VALUES(hora_fin),
                materia_nombre = VALUES(materia_nombre),
                docente_nombre = VALUES(docente_nombre),
                aula = VALUES(aula)
        ");

        $stmt->execute([
            ':id' => $id,
            ':gid' => $grado_id,
            ':gnom' => $grado_nombre,
            ':dia' => $dia,
            ':hi' => $hora_inicio,
            ':hf' => $hora_fin,
            ':mat' => $materia_nombre,
            ':doc' => $docente_nombre,
            ':aula' => $aula
        ]);

        echo json_encode(["success" => true, "message" => "Horario guardado en MySQL"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $id = isset($_GET['id']) ? trim($_GET['id']) : '';

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "ID de horario requerido"]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM horarios WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true, "message" => "Horario eliminado en MySQL"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}
