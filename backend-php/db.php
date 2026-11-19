<?php
// =====================================================================
// CONEXIÓN A BASE DE DATOS MYSQL CON PDO Y CABECERAS CORS
// =====================================================================

// Permitir peticiones desde cualquier origen (React en localhost:3000 o producción)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Si es una petición de comprobación previa (OPTIONS), responder HTTP 200 y salir
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de credenciales de XAMPP / MySQL por defecto
$host = "localhost";
$dbname = "asiscr";
$username = "root";
$password = ""; // En XAMPP la contraseña de root suele estar vacía por defecto

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error de conexión a MySQL: " . $e->getMessage()
    ]);
    exit();
}
