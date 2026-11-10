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

describe("Loans API — tabla de amortización", () => {
  const app = createApp();

  beforeEach(() => {
    store.clear();
  });

  async function crearSolicitudParaTabla() {
    const res = await request(app).post("/api/loans").send({
      customerId: "cust-200",
      amount: 1200,
      termMonths: 12,
      annualInterestRate: 0.12,
    });
    return res.body;
  }

  test("GET /api/loans/:id/schedule usa FRENCH por defecto", async () => {
    const loan = await crearSolicitudParaTabla();

    const defaultRes = await request(app).get(`/api/loans/${loan.id}/schedule`);
    const frenchRes = await request(app).get(
      `/api/loans/${loan.id}/schedule?amortizationType=FRENCH`
    );

    expect(defaultRes.status).toBe(200);
    expect(defaultRes.body.amortizationType).toBe("FRENCH");
    expect(defaultRes.body.schedule).toHaveLength(12);
    expect(defaultRes.body.schedule).toEqual(frenchRes.body.schedule);
  });

  test("GET /api/loans/:id/schedule soporta GERMAN con cuota decreciente", async () => {
    const loan = await crearSolicitudParaTabla();

    const res = await request(app).get(
      `/api/loans/${loan.id}/schedule?amortizationType=GERMAN`
    );

    expect(res.status).toBe(200);
    expect(res.body.amortizationType).toBe("GERMAN");
    expect(res.body.schedule).toHaveLength(12);
    expect(res.body.schedule[0].principal).toBe(100);
    expect(res.body.schedule[1].principal).toBe(100);
    expect(res.body.schedule[0].payment).toBeGreaterThan(res.body.schedule[1].payment);
    expect(res.body.schedule[1].payment).toBeGreaterThan(res.body.schedule[2].payment);
    expect(res.body.schedule[11].remainingBalance).toBe(0);
  });

  test("GET /api/loans/:id/schedule valida amortizationType", async () => {
    const loan = await crearSolicitudParaTabla();

    const res = await request(app).get(
      `/api/loans/${loan.id}/schedule?amortizationType=UNKNOWN`
    );

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("amortizationType");
  });
});
