<?php
// ==============================================================================
// ASISCR - ARCHIVO DE CONEXIÓN A BASE DE DATOS (PDO MYSQL)
// ==============================================================================

// Cabeceras CORS obligatorias para que el frontend React se comunique con PHP
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Responder inmediatamente a peticiones preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de credenciales de MySQL (XAMPP / WampServer por defecto)
$db_host = 'localhost';
$db_name = 'asiscr_db';
$db_user = 'root';
$db_pass = ''; // En XAMPP la contraseña por defecto de root es vacía
$db_charset = 'utf8mb4';

$dsn = "mysql:host=$db_host;dbname=$db_name;charset=$db_charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Error al conectar con la base de datos MySQL: ' . $e->getMessage()
    ]);
    exit();
}
