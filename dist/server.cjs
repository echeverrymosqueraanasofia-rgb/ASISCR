var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_http = __toESM(require("http"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
async function startServer() {
  const app = (0, import_express.default)();
  const server = import_http.default.createServer(app);
  const args = process.argv.slice(2);
  let port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  let host = process.env.HOST || "0.0.0.0";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--port" && args[i + 1]) {
      port = parseInt(args[i + 1], 10);
    }
    if (args[i] === "--host" && args[i + 1]) {
      host = args[i + 1];
    }
  }
  app.use(import_express.default.json());
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "ASISCR API Server" });
  });
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
  app.get("/api/v1/firebase/status", (req, res) => {
    res.json({
      engine: "Firebase Firestore & Auth",
      version: "Version 2.0 - Realtime NoSQL Sync",
      status: "active",
      collections: ["usuarios", "estudiantes", "grados", "materias", "asistencias"]
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: {
        middlewareMode: true,
        hmr: {
          server
        }
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  server.listen(port, host, () => {
    console.log(`ASISCR Server running on http://${host}:${port}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
