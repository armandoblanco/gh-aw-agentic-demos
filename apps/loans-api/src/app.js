const express = require("express");
const loansRouter = require("./routes/loans");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/loans", loansRouter);

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  // Manejador de errores centralizado
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`loans-api escuchando en http://localhost:${port}`);
  });
}

module.exports = { createApp };
