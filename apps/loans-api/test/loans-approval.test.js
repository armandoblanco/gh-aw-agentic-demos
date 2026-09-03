const request = require("supertest");
const { createApp } = require("../src/app");
const { store } = require("../src/routes/loans");

describe("Loans API — flujo de aprobación y rechazo", () => {
  const app = createApp();

  beforeEach(() => {
    store.clear();
  });

  async function crearSolicitud() {
    const res = await request(app).post("/api/loans").send({
      customerId: "cust-100",
      amount: 8000,
      termMonths: 12,
      annualInterestRate: 0.2,
    });
    return res.body;
  }

  test("PATCH /approve aprueba una solicitud pendiente", async () => {
    const loan = await crearSolicitud();
    const res = await request(app).patch(`/api/loans/${loan.id}/approve`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("APPROVED");
    expect(res.body.approvedAt).toBeDefined();
  });

  test("PATCH /reject rechaza una solicitud pendiente con motivo", async () => {
    const loan = await crearSolicitud();
    const res = await request(app)
      .patch(`/api/loans/${loan.id}/reject`)
      .send({ reason: "Historial crediticio insuficiente" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("REJECTED");
    expect(res.body.reason).toBe("Historial crediticio insuficiente");
  });

  test("no permite aprobar dos veces la misma solicitud", async () => {
    const loan = await crearSolicitud();
    await request(app).patch(`/api/loans/${loan.id}/approve`);
    const res = await request(app).patch(`/api/loans/${loan.id}/approve`);
    expect(res.status).toBe(409);
  });

  test("PATCH /approve devuelve 404 si la solicitud no existe", async () => {
    const res = await request(app).patch("/api/loans/no-existe/approve");
    expect(res.status).toBe(404);
  });
});
