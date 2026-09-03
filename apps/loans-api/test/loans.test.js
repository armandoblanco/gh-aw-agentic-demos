const request = require("supertest");
const { createApp } = require("../src/app");
const { store } = require("../src/routes/loans");

describe("Loans API — creación y consulta de solicitudes", () => {
  const app = createApp();

  beforeEach(() => {
    store.clear();
  });

  test("POST /api/loans crea una solicitud válida", async () => {
    const res = await request(app).post("/api/loans").send({
      customerId: "cust-001",
      amount: 15000,
      termMonths: 24,
      annualInterestRate: 0.18,
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      customerId: "cust-001",
      amount: 15000,
      termMonths: 24,
      status: "PENDING_APPROVAL",
    });
    expect(res.body.id).toBeDefined();
  });

  test("POST /api/loans rechaza un monto negativo", async () => {
    const res = await request(app).post("/api/loans").send({
      customerId: "cust-002",
      amount: -500,
      termMonths: 12,
      annualInterestRate: 0.15,
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("amount")])
    );
  });

  test("POST /api/loans rechaza un customerId vacío o solo espacios", async () => {
    const res = await request(app).post("/api/loans").send({
      customerId: "   ",
      amount: 1000,
      termMonths: 12,
      annualInterestRate: 0.15,
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("customerId")])
    );
  });

  test("GET /api/loans/:id devuelve 404 si no existe", async () => {
    const res = await request(app).get("/api/loans/no-existe");
    expect(res.status).toBe(404);
  });

  test("GET /api/loans lista las solicitudes creadas", async () => {
    await request(app).post("/api/loans").send({
      customerId: "cust-003",
      amount: 5000,
      termMonths: 6,
      annualInterestRate: 0.1,
    });

    const res = await request(app).get("/api/loans");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});
