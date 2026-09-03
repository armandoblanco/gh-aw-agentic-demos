# Changelog — loans-api

## [1.0.0] - 2026-09-03

### Agregado
- `POST /api/loans`, `GET /api/loans`, `GET /api/loans/:id` — creación y consulta de solicitudes de préstamo.
- `PATCH /api/loans/:id/approve` y `PATCH /api/loans/:id/reject` — flujo de aprobación/rechazo.
- Validaciones de monto, plazo y tasa de interés.
- Suite de pruebas unitarias con Jest + Supertest.

### Notas
- El cálculo de tabla de amortización (`GET /api/loans/:id/schedule`) está en revisión
  en el PR #8 y se incluirá en una próxima versión menor.
