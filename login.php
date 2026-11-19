<?php
// ==============================================================================
// ASISCR - ENDPOINT DE INICIO DE SESIÓN (login.php)
// ==============================================================================
require_once __DIR__ . '/db.php';

// Leer el cuerpo JSON enviado por React
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || !isset($data['documento']) || !isset($data['contrasena'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Faltan parámetros requeridos (documento o contraseña).'
    ]);
    exit();
}

$documento = trim($data['documento']);
$contrasena = trim($data['contrasena']);
$tipo_acceso = isset($data['tipo_acceso']) ? trim($data['tipo_acceso']) : null;

try {
    // Consulta protegida contra Inyección SQL mediante Sentencias Preparadas PDO
    $stmt = $pdo->prepare('SELECT id, nombre, tipo, documento, contrasena FROM usuarios WHERE documento = :documento LIMIT 1');
    $stmt->execute(['documento' => $documento]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Usuario no encontrado con ese número de documento.'
        ]);
        exit();
    }

    // Verificación de contraseña (soporta texto plano para demo o password_verify para hashes)
    $passwordValid = ($contrasena === $user['contrasena']) || password_verify($contrasena, $user['contrasena']);

    if (!$passwordValid) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Contraseña incorrecta.'
        ]);
        exit();
    }

    // Si se especifica tipo de acceso (docente vs estudiante), validar permiso
    if ($tipo_acceso === 'docente' && !in_array($user['tipo'], ['docente', 'directivo'])) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'El usuario no tiene rol docente ni directivo.'
        ]);
        exit();
    }

    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Autenticación exitosa',
        'user' => [
            'id' => (string)$user['id'],
            'nombre' => $user['nombre'],
            'tipo' => $user['tipo'],
            'documento' => $user['documento']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno en el servidor: ' . $e->getMessage()
    ]);
}
