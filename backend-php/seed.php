<?php
require_once __DIR__ . '/db.php';

try {
    // Leer y ejecutar las instrucciones de database.sql si existe
    $sqlFile = __DIR__ . '/database.sql';
    if (file_exists($sqlFile)) {
        $sql = file_get_contents($sqlFile);
        $pdo->exec($sql);
        echo json_encode([
            "success" => true,
            "message" => "Base de datos MySQL 'asiscr' inicializada y sembrada con éxito con las 7 tablas oficiales."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "No se encontró el archivo database.sql en el servidor backend."
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error al sembrar la base de datos MySQL: " . $e->getMessage()
    ]);
}
