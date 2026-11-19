<?php
require_once __DIR__ . '/db.php';

// Leer el JSON recibido en la solicitud
$input = json_decode(file_get_contents('php://input'), true);

$documento = isset($input['documento']) ? trim($input['documento']) : '';
$contrasena = isset($input['contrasena']) ? trim($input['contrasena']) : '';
$tipo_acceso = isset($input['tipo_acceso']) ? trim($input['tipo_acceso']) : '';

if (empty($documento) || empty($contrasena)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Documento y contraseña requeridos"]);
    exit();
}

try {
    // Buscar usuario por documento o correo electrónico (o alias super_user)
    $stmt = $pdo->prepare("SELECT id, nombre, email, tipo, documento, contrasena, activo FROM usuarios WHERE documento = :doc OR email = :email OR (tipo = 'super_user' AND :alias IN ('123456', 'super', 'admin')) LIMIT 1");
    $stmt->execute([
        ':doc' => $documento,
        ':email' => $documento,
        ':alias' => $documento
    ]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
        exit();
    }

    if ($user['activo'] == 0) {
        echo json_encode(["success" => false, "message" => "Esta cuenta se encuentra inactiva"]);
        exit();
    }

    // Comprobación de contraseña
    if ($user['contrasena'] !== $contrasena) {
        echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
        exit();
    }

    // Retornar información del usuario sin exponer la contraseña
    unset($user['contrasena']);
    echo json_encode([
        "success" => true,
        "message" => "Autenticación exitosa",
        "user" => $user
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de consulta: " . $e->getMessage()]);
}
