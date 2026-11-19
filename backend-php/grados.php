<?php
require_once __DIR__ . '/db.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT id, nombre, director_grupo FROM grados ORDER BY nombre ASC");
        echo json_encode(["success" => true, "data" => $stmt->fetchAll()]);
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = isset($input['id']) ? trim($input['id']) : 'gr_' . uniqid();
        $nombre = isset($input['nombre']) ? trim($input['nombre']) : '';
        $director = isset($input['director_grupo']) ? trim($input['director_grupo']) : '';

        if ($nombre === '' || $director === '') {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "El nombre del grupo y su director son obligatorios"]);
            exit();
        }

        $pdo->beginTransaction();
        $duplicate = $pdo->prepare("SELECT id FROM grados WHERE LOWER(nombre) = LOWER(:nombre) AND id <> :id LIMIT 1");
        $duplicate->execute([':nombre' => $nombre, ':id' => $id]);
        if ($duplicate->fetch()) {
            $pdo->rollBack();
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "Ya existe un grupo con ese nombre"]);
            exit();
        }

        $existing = $pdo->prepare("SELECT nombre FROM grados WHERE id = :id");
        $existing->execute([':id' => $id]);
        $old = $existing->fetch();

        if ($old) {
            $stmt = $pdo->prepare("UPDATE grados SET nombre = :nombre, director_grupo = :director WHERE id = :id");
            $stmt->execute([':nombre' => $nombre, ':director' => $director, ':id' => $id]);
            if ($old['nombre'] !== $nombre) {
                $stmt = $pdo->prepare("UPDATE estudiantes SET grado = :new_name WHERE grado = :old_name OR grado = :id");
                $stmt->execute([':new_name' => $nombre, ':old_name' => $old['nombre'], ':id' => $id]);
                $stmt = $pdo->prepare("UPDATE horarios SET grado_nombre = :new_name WHERE grado_id = :id OR grado_nombre = :old_name");
                $stmt->execute([':new_name' => $nombre, ':id' => $id, ':old_name' => $old['nombre']]);
                $stmt = $pdo->prepare("UPDATE usuarios SET grado = :new_name WHERE grado = :old_name OR grado = :id");
                $stmt->execute([':new_name' => $nombre, ':old_name' => $old['nombre'], ':id' => $id]);
            }
        } else {
            $stmt = $pdo->prepare("INSERT INTO grados (id, nombre, director_grupo) VALUES (:id, :nombre, :director)");
            $stmt->execute([':id' => $id, ':nombre' => $nombre, ':director' => $director]);
        }

        $pdo->commit();
        echo json_encode(["success" => true, "message" => "Grupo guardado correctamente"]);
    } elseif ($method === 'DELETE') {
        $id = isset($_GET['id']) ? trim($_GET['id']) : '';
        if ($id === '') {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "ID de grupo requerido"]);
            exit();
        }

        $stmt = $pdo->prepare("SELECT nombre FROM grados WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $grade = $stmt->fetch();
        if (!$grade) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "El grupo no existe"]);
            exit();
        }

        $dependencies = [
            ['materias', 'grado_id', $id],
        ];
        foreach ($dependencies as [$table, $column, $value]) {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM `$table` WHERE `$column` = :value");
            $stmt->execute([':value' => $value]);
            if ((int)$stmt->fetchColumn() > 0) {
                http_response_code(409);
                echo json_encode(["success" => false, "message" => "No se puede eliminar el grupo porque tiene estudiantes, materias, horarios o usuarios asignados"]);
                exit();
            }
        }
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM estudiantes WHERE grado = :name OR grado = :id");
        $stmt->execute([':name' => $grade['nombre'], ':id' => $id]);
        $studentCount = (int)$stmt->fetchColumn();
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM horarios WHERE grado_id = :id OR grado_nombre = :name");
        $stmt->execute([':id' => $id, ':name' => $grade['nombre']]);
        $scheduleCount = (int)$stmt->fetchColumn();
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE grado = :name OR grado = :id");
        $stmt->execute([':name' => $grade['nombre'], ':id' => $id]);
        $userCount = (int)$stmt->fetchColumn();
        if ($studentCount + $scheduleCount + $userCount > 0) {
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "No se puede eliminar el grupo porque tiene estudiantes, materias, horarios o usuarios asignados"]);
            exit();
        }

        $stmt = $pdo->prepare("DELETE FROM grados WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true, "message" => "Grupo eliminado correctamente"]);
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido"]);
    }
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error procesando el grupo: " . $e->getMessage()]);
}
