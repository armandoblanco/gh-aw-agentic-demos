# Loans API — API REST de Préstamos Bancarios

Aplicación de demostración (datos sintéticos) usada para probar los workflows
agénticos de `gh-aw` de este repositorio. Simula el backend de un banco para
la gestión de solicitudes de préstamo: creación, aprobación/rechazo y cálculo
de tabla de amortización.

> ⚠️ Esta es una app **ficticia con fines de demo**. No procesa dinero real,
> no está conectada a ningún sistema bancario y su almacenamiento es en
> memoria (se reinicia al reiniciar el proceso).

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/loans` | Crea una nueva solicitud de préstamo |
| `GET` | `/api/loans` | Lista todas las solicitudes |
| `GET` | `/api/loans/:id` | Obtiene el detalle de una solicitud |
| `PATCH` | `/api/loans/:id/approve` | Aprueba una solicitud pendiente |
| `PATCH` | `/api/loans/:id/reject` | Rechaza una solicitud pendiente |
| `GET` | `/api/loans/:id/schedule` | Calcula la tabla de amortización |

## Modelo de una solicitud de préstamo

```json
{
  "id": "uuid",
  "customerId": "string",
  "amount": 15000,
  "termMonths": 24,
  "annualInterestRate": 0.18,
  "status": "PENDING_APPROVAL | APPROVED | REJECTED",
  "createdAt": "ISO-8601"
}
```

## Ejecutar localmente

```bash
cd apps/loans-api
npm install
npm start        # levanta el servidor en http://localhost:3000
npm test         # corre la suite de pruebas
```

## Reglas de negocio actuales

- `amount` debe ser mayor que 0.
- `termMonths` debe estar entre 1 y 360.
- `annualInterestRate` debe ser mayor o igual a 0.
- Solo se puede aprobar/rechazar una solicitud en estado `PENDING_APPROVAL`.
