<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT id, categoria, titulo, mensaje, emisor_id, emisor_nombre, emisor_rol, destinatario_rol, estudiante_nombre, grado, prioridad, estado, respuesta, atendido_por, fecha FROM avisos ORDER BY fecha DESC");
        $avisos = $stmt->fetchAll();
        echo json_encode(["success" => true, "data" => $avisos]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $id = isset($input['id']) ? $input['id'] : 'av_' . time();
    $categoria = isset($input['categoria']) ? trim($input['categoria']) : 'comunicado_general';
    $titulo = isset($input['titulo']) ? trim($input['titulo']) : '';
    $mensaje = isset($input['mensaje']) ? trim($input['mensaje']) : '';
    $emisor_id = isset($input['emisor_id']) ? trim($input['emisor_id']) : '';
    $emisor_nombre = isset($input['emisor_nombre']) ? trim($input['emisor_nombre']) : '';
    $emisor_rol = isset($input['emisor_rol']) ? trim($input['emisor_rol']) : 'docente';
    $destinatario_rol = isset($input['destinatario_rol']) ? trim($input['destinatario_rol']) : 'porteria';
    $estudiante_nombre = isset($input['estudiante_nombre']) ? trim($input['estudiante_nombre']) : null;
    $grado = isset($input['grado']) ? trim($input['grado']) : null;
    $prioridad = isset($input['prioridad']) ? trim($input['prioridad']) : 'normal';
    $estado = isset($input['estado']) ? trim($input['estado']) : 'pendiente';
    $respuesta = isset($input['respuesta']) ? trim($input['respuesta']) : null;
    $atendido_por = isset($input['atendido_por']) ? trim($input['atendido_por']) : null;
    $fecha = isset($input['fecha']) ? trim($input['fecha']) : date('Y-m-d H:i');

    try {
        $stmt = $pdo->prepare("
            INSERT INTO avisos (id, categoria, titulo, mensaje, emisor_id, emisor_nombre, emisor_rol, destinatario_rol, estudiante_nombre, grado, prioridad, estado, respuesta, atendido_por, fecha)
            VALUES (:id, :cat, :tit, :men, :eid, :enom, :erol, :drol, :esnom, :gra, :prio, :est, :resp, :atp, :fec)
            ON DUPLICATE KEY UPDATE
                categoria = VALUES(categoria),
                titulo = VALUES(titulo),
                mensaje = VALUES(mensaje),
                estado = VALUES(estado),
                respuesta = VALUES(respuesta),
                atendido_por = VALUES(atendido_por)
        ");

        $stmt->execute([
            ':id' => $id,
            ':cat' => $categoria,
            ':tit' => $titulo,
            ':men' => $mensaje,
            ':eid' => $emisor_id,
            ':enom' => $emisor_nombre,
            ':erol' => $emisor_rol,
            ':drol' => $destinatario_rol,
            ':esnom' => $estudiante_nombre,
            ':gra' => $grado,
            ':prio' => $prioridad,
            ':est' => $estado,
            ':resp' => $respuesta,
            ':atp' => $atendido_por,
            ':fec' => $fecha
        ]);

        echo json_encode(["success" => true, "message" => "Aviso publicado en MySQL"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} elseif ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);

    $id = isset($input['id']) ? trim($input['id']) : '';
    $estado = isset($input['estado']) ? trim($input['estado']) : 'atendido';
    $atendido_por = isset($input['atendido_por']) ? trim($input['atendido_por']) : null;
    $respuesta = isset($input['respuesta']) ? trim($input['respuesta']) : null;

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "ID de aviso requerido"]);
        exit();
    }

    try {
        $sql = "UPDATE avisos SET estado = :est";
        $params = [':est' => $estado, ':id' => $id];

        if ($atendido_por !== null) {
            $sql .= ", atendido_por = :atp";
            $params[':atp'] = $atendido_por;
        }
        if ($respuesta !== null) {
            $sql .= ", respuesta = :resp";
            $params[':resp'] = $respuesta;
        }
        $sql .= " WHERE id = :id";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode(["success" => true, "message" => "Estado de aviso actualizado en MySQL"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $id = isset($_GET['id']) ? trim($_GET['id']) : '';

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "ID de aviso requerido"]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM avisos WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true, "message" => "Aviso eliminado en MySQL"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}
