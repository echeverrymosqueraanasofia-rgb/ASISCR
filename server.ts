import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  const args = process.argv.slice(2);
  let port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  let host = process.env.HOST || "0.0.0.0";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--port" && args[i + 1]) {
      port = parseInt(args[i + 1], 10);
    }
    if (args[i] === "--host" && args[i + 1]) {
      host = args[i + 1];
    }
  }

  app.use(express.json());

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "ASISCR API Server" });
  });

  // Simulated PHP REST endpoints
  app.get("/api/v1/php/status", (req, res) => {
    res.json({
      engine: "PHP 8.2 / PDO MySQL",
      version: "Version 1.0 - PHP REST Service",
      status: "active",
      endpoints: [
        "POST /api/v1/php/login.php",
        "GET /api/v1/php/get_asistencia.php",
        "POST /api/v1/php/save_asistencia.php",
        "GET /api/v1/php/get_expediente.php"
      ]
    });
  });

  // Simulated Firebase endpoints
  app.get("/api/v1/firebase/status", (req, res) => {
    res.json({
      engine: "Firebase Firestore & Auth",
      version: "Version 2.0 - Realtime NoSQL Sync",
      status: "active",
      collections: ["usuarios", "estudiantes", "grados", "materias", "asistencias"]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(port, host, () => {
    console.log(`ASISCR Server running on http://${host}:${port}`);
  });
}

startServer();

