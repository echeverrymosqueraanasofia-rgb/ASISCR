<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$grado = isset($_GET['grado_id']) ? trim($_GET['grado_id']) : '';

if ($method === 'GET') {
    try {
        if (!empty($grado) && $grado !== 'todos') {
            $stmt = $pdo->prepare("
                SELECT e.id, e.nombre, e.grado, e.documento, e.nombre_acudiente, e.telefono_acudiente, e.id_padre
                FROM estudiantes e
                LEFT JOIN grados g ON e.grado = g.nombre OR e.grado = g.id
                WHERE e.grado = :grade_value OR g.id = :grade_id OR g.nombre = :grade_name
                ORDER BY e.nombre ASC
            ");
            $stmt->execute([':grade_value' => $grado, ':grade_id' => $grado, ':grade_name' => $grado]);
        } else {
            $stmt = $pdo->query("SELECT id, nombre, grado, documento, nombre_acudiente, telefono_acudiente, id_padre FROM estudiantes ORDER BY nombre ASC");
        }
        echo json_encode(["success" => true, "data" => $stmt->fetchAll()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = isset($input['id']) ? trim($input['id']) : 'est_' . uniqid();
    $nombre = isset($input['nombre']) ? trim($input['nombre']) : '';
    $grado = isset($input['grado']) ? trim($input['grado']) : '';
    $documento = isset($input['documento']) ? trim($input['documento']) : '';
    $nombre_acudiente = isset($input['nombre_acudiente']) ? trim($input['nombre_acudiente']) : '';
    $telefono_acudiente = isset($input['telefono_acudiente']) ? trim($input['telefono_acudiente']) : '';
    $id_padre = isset($input['id_padre']) ? trim($input['id_padre']) : '';

    if ($nombre === '' || $grado === '' || $documento === '') {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Nombre, grupo y documento son obligatorios"]);
        exit();
    }

    try {
        $duplicate = $pdo->prepare("SELECT id FROM estudiantes WHERE documento = :documento AND id <> :id LIMIT 1");
        $duplicate->execute([':documento' => $documento, ':id' => $id]);
        if ($duplicate->fetch()) {
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "Ya existe un estudiante con ese documento"]);
            exit();
        }

        $existing = $pdo->prepare("SELECT id FROM estudiantes WHERE id = :id");
        $existing->execute([':id' => $id]);
        if ($existing->fetch()) {
            $stmt = $pdo->prepare("
                UPDATE estudiantes
                SET nombre = :nombre, grado = :grado, documento = :documento,
                    nombre_acudiente = :acudiente, telefono_acudiente = :telefono, id_padre = :id_padre
                WHERE id = :id
            ");
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO estudiantes (id, nombre, grado, documento, nombre_acudiente, telefono_acudiente, id_padre)
                VALUES (:id, :nombre, :grado, :documento, :acudiente, :telefono, :id_padre)
            ");
        }
        $stmt->execute([
            ':id' => $id,
            ':nombre' => $nombre,
            ':grado' => $grado,
            ':documento' => $documento,
            ':acudiente' => $nombre_acudiente,
            ':telefono' => $telefono_acudiente,
            ':id_padre' => $id_padre,
        ]);
        echo json_encode(["success" => true, "message" => "Estudiante guardado correctamente"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error guardando estudiante: " . $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $id = isset($_GET['id']) ? trim($_GET['id']) : '';
    if ($id === '') {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "ID de estudiante requerido"]);
        exit();
    }

    try {
        $attendance = $pdo->prepare("SELECT COUNT(*) FROM asistencias WHERE estudiante_id = :id");
        $attendance->execute([':id' => $id]);
        if ((int)$attendance->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "No se puede eliminar el estudiante porque tiene registros de asistencia"]);
            exit();
        }
        $stmt = $pdo->prepare("DELETE FROM estudiantes WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true, "message" => "Estudiante eliminado correctamente"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
}
