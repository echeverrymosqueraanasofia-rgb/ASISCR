<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Diagnóstico de conexión a MySQL
$db_connected = false;
$db_error = null;
$stats = [];

$host = "localhost";
$dbname = "asiscr";
$username = "root";
$password = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $db_connected = true;

    // Obtener conteo de tablas
    $tables = ['usuarios', 'grados', 'materias', 'estudiantes', 'asistencias', 'horarios', 'avisos'];
    foreach ($tables as $t) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM `$t`");
            $row = $stmt->fetch();
            $stats[$t] = $row['cnt'];
        } catch (Exception $ex) {
            $stats[$t] = "Tabla no creada";
        }
    }
} catch (Exception $e) {
    $db_connected = false;
    $db_error = $e->getMessage();
}

// Si la petición espera JSON (ej. axios/fetch ping), responder JSON
if (isset($_GET['format']) && $_GET['format'] === 'json') {
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode([
        "status" => $db_connected ? "online" : "error",
        "engine" => "PHP " . phpversion(),
        "database" => $dbname,
        "connected" => $db_connected,
        "counts" => $stats,
        "error" => $db_error
    ]);
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ASISCR - Servidor Backend PHP & MySQL Local</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #faf5e8;
      color: #3b1406;
      margin: 0;
      padding: 30px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .card {
      background: white;
      border: 2px border #fde68a;
      border-radius: 24px;
      max-width: 680px;
      width: 100%;
      padding: 32px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);
      box-sizing: border-box;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
    .badge-error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    h1 { font-size: 24px; font-weight: 900; margin: 16px 0 8px 0; color: #3b1406; }
    p { font-size: 14px; color: #78350f; line-height: 1.5; margin: 4px 0 20px 0; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #ea580c;
      color: white;
      padding: 14px 24px;
      border-radius: 14px;
      text-decoration: none;
      font-weight: 800;
      font-size: 14px;
      transition: background 0.2s;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
    }
    .btn:hover { background: #c2410c; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 10px;
      margin: 20px 0;
    }
    .stat-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 14px;
      padding: 12px;
      text-align: center;
    }
    .stat-label { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #92400e; }
    .stat-value { font-size: 20px; font-weight: 900; color: #3b1406; margin-top: 4px; }
    .endpoints {
      background: #270c04;
      color: #fde68a;
      padding: 16px;
      border-radius: 14px;
      font-family: monospace;
      font-size: 12px;
      overflow-x: auto;
    }
    .info-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 14px;
      padding: 16px;
      margin-top: 20px;
      color: #1e40af;
      font-size: 13px;
      line-height: 1.5;
    }
  </style>
</head>
<body>

  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span class="badge <?php echo $db_connected ? 'badge-success' : 'badge-error'; ?>">
        ● <?php echo $db_connected ? 'Servidor PHP y MySQL Conectados' : 'Error en MySQL'; ?>
      </span>
      <span style="font-size: 12px; font-weight: bold; color: #78350f;">
        PHP v<?php echo phpversion(); ?>
      </span>
    </div>

    <h1>ASISCR • API Backend PHP Local</h1>
    <p>
      Este es el servidor API local de Apache/MySQL que atiende las solicitudes de datos de la aplicación.
    </p>

    <?php if ($db_connected): ?>
      <div style="margin-bottom: 20px;">
        <a href="http://localhost:3000" class="btn" target="_blank">
          🚀 Abrir Aplicación Web ASISCR (http://localhost:3000)
        </a>
      </div>

      <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #78350f; margin-top: 15px;">
        Registros actuales en tu Base de Datos MySQL (asiscr):
      </div>

      <div class="grid">
        <?php foreach ($stats as $tbl => $cnt): ?>
          <div class="stat-box">
            <div class="stat-label"><?php echo htmlspecialchars($tbl); ?></div>
            <div class="stat-value"><?php echo htmlspecialchars($cnt); ?></div>
          </div>
        <?php endforeach; ?>
      </div>

    <?php else: ?>
      <div class="info-box" style="background: #fee2e2; border-color: #fca5a5; color: #991b1b;">
        <strong>⚠️ No se pudo conectar con la base de datos MySQL:</strong><br>
        <?php echo htmlspecialchars($db_error); ?><br><br>
        <em>Solución rápida:</em> Abre XAMPP y presiona <strong>Start</strong> en <strong>MySQL</strong>. Asegúrate de importar el archivo <code>database.sql</code> en <strong>phpMyAdmin</strong>.
      </div>
    <?php endif; ?>

    <div class="info-box">
      <strong>ℹ️ ¿Por qué esta URL muestra este panel?</strong><br>
      La ruta <code>http://localhost/asiscr/backend-php</code> es la <strong>carpeta del API Backend</strong> en Apache. 
      La aplicación interactiva para docentes, directivos y estudiantes se ejecuta en <strong>http://localhost:3000</strong>.
    </div>

    <p style="margin-top: 20px; font-weight: bold; font-size: 13px;">Endpoints API activos en este servidor:</p>
    <div class="endpoints">
      POST /asiscr/backend-php/login.php<br>
      GET/POST /asiscr/backend-php/usuarios.php<br>
      GET/POST /asiscr/backend-php/horarios.php<br>
      GET/POST/PUT /asiscr/backend-php/avisos.php<br>
      GET /asiscr/backend-php/grados.php<br>
      GET /asiscr/backend-php/materias.php<br>
      GET /asiscr/backend-php/estudiantes.php<br>
      POST /asiscr/backend-php/save_asistencia.php<br>
      GET /asiscr/backend-php/get_expediente.php
    </div>
  </div>

</body>
</html>
