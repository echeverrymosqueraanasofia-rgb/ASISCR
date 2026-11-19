<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT id, nombre, email, tipo, documento, contrasena, telefono, grado, modulos_permitidos, activo FROM usuarios ORDER BY nombre ASC");
        $users = $stmt->fetchAll();

        // Convertir modulos_permitidos de JSON a array
        foreach ($users as &$u) {
            $u['activo'] = (bool)$u['activo'];
            $u['modulosPermitidos'] = !empty($u['modulos_permitidos']) ? json_decode($u['modulos_permitidos'], true) : [];
            unset($u['modulos_permitidos']);
        }

        echo json_encode(["success" => true, "data" => $users]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $id = isset($input['id']) ? $input['id'] : 'usr_' . time();
    $nombre = isset($input['nombre']) ? trim($input['nombre']) : '';
    $email = isset($input['email']) ? trim($input['email']) : '';
    $tipo = isset($input['tipo']) ? trim($input['tipo']) : 'docente';
    $documento = isset($input['documento']) ? trim($input['documento']) : '';
    $contrasena = isset($input['contrasena']) ? trim($input['contrasena']) : '123456';
    $telefono = isset($input['telefono']) ? trim($input['telefono']) : '';
    $grado = isset($input['grado']) ? trim($input['grado']) : null;
    $modulos = isset($input['modulosPermitidos']) && is_array($input['modulosPermitidos']) ? json_encode($input['modulosPermitidos']) : null;
    $activo = isset($input['activo']) ? ($input['activo'] ? 1 : 0) : 1;

    if (empty($nombre) || empty($documento)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Nombre y documento requeridos"]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO usuarios (id, nombre, email, tipo, documento, contrasena, telefono, grado, modulos_permitidos, activo)
            VALUES (:id, :nom, :email, :tipo, :doc, :pass, :tel, :grado, :modulos, :activo)
            ON DUPLICATE KEY UPDATE
                nombre = VALUES(nombre),
                email = VALUES(email),
                tipo = VALUES(tipo),
                contrasena = VALUES(contrasena),
                telefono = VALUES(telefono),
                grado = VALUES(grado),
                modulos_permitidos = VALUES(modulos_permitidos),
                activo = VALUES(activo)
        ");

        $stmt->execute([
            ':id' => $id,
            ':nom' => $nombre,
            ':email' => $email,
            ':tipo' => $tipo,
            ':doc' => $documento,
            ':pass' => $contrasena,
            ':tel' => $telefono,
            ':grado' => $grado,
            ':modulos' => $modulos,
            ':activo' => $activo
        ]);

        echo json_encode(["success" => true, "message" => "Usuario guardado en MySQL con éxito"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error guardando usuario: " . $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $id = isset($_GET['id']) ? trim($_GET['id']) : '';

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "ID de usuario requerido"]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true, "message" => "Usuario eliminado en MySQL"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}
