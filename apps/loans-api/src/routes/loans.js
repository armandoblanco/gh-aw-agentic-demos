const express = require("express");
const { LoanStore, LOAN_STATUS } = require("../models/loanStore");

const router = express.Router();
const store = new LoanStore();
const AMORTIZATION_TYPES = Object.freeze({
  FRENCH: "FRENCH",
  GERMAN: "GERMAN",
});

function roundToCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function buildFrenchSchedule({ amount, termMonths, annualInterestRate }) {
  const monthlyRate = annualInterestRate / 12;
  const schedule = [];
  const basePayment =
    monthlyRate === 0
      ? amount / termMonths
      : (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
  let remainingBalance = amount;

  for (let month = 1; month <= termMonths; month += 1) {
    const interest = remainingBalance * monthlyRate;
    const principal = month === termMonths ? remainingBalance : basePayment - interest;
    const payment = principal + interest;
    remainingBalance -= principal;

    schedule.push({
      installment: month,
      payment: roundToCents(payment),
      principal: roundToCents(principal),
      interest: roundToCents(interest),
      remainingBalance: roundToCents(remainingBalance),
    });
  }

  return schedule;
}

function buildGermanSchedule({ amount, termMonths, annualInterestRate }) {
  const monthlyRate = annualInterestRate / 12;
  const schedule = [];
  const basePrincipal = amount / termMonths;
  let remainingBalance = amount;

  for (let month = 1; month <= termMonths; month += 1) {
    const interest = remainingBalance * monthlyRate;
    const principal = month === termMonths ? remainingBalance : basePrincipal;
    const payment = principal + interest;
    remainingBalance -= principal;

    schedule.push({
      installment: month,
      payment: roundToCents(payment),
      principal: roundToCents(principal),
      interest: roundToCents(interest),
      remainingBalance: roundToCents(remainingBalance),
    });
  }

  return schedule;
}

function validateLoanInput({ customerId, amount, termMonths, annualInterestRate }) {
  const errors = [];
  if (!customerId || typeof customerId !== "string" || customerId.trim().length === 0) {
    errors.push("customerId es requerido y debe ser texto no vacío");
  }
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    errors.push("amount debe ser un número finito mayor que 0");
  }
  if (!Number.isInteger(termMonths) || termMonths < 1 || termMonths > 360) {
    errors.push("termMonths debe ser un entero entre 1 y 360");
  }
  if (typeof annualInterestRate !== "number" || annualInterestRate < 0) {
    errors.push("annualInterestRate debe ser un número mayor o igual a 0");
  }
  return errors;
}

// POST /api/loans - crea una nueva solicitud de préstamo
router.post("/", (req, res) => {
  const errors = validateLoanInput(req.body || {});
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const loan = store.create(req.body);
  return res.status(201).json(loan);
});

// GET /api/loans - lista todas las solicitudes
router.get("/", (_req, res) => {
  return res.json(store.list());
});

// GET /api/loans/:id - obtiene el detalle de una solicitud
router.get("/:id", (req, res) => {
  const loan = store.get(req.params.id);
  if (!loan) {
    return res.status(404).json({ error: "Solicitud de préstamo no encontrada" });
  }
  return res.json(loan);
});

// GET /api/loans/:id/schedule - calcula tabla de amortización
router.get("/:id/schedule", (req, res) => {
  const loan = store.get(req.params.id);
  if (!loan) {
    return res.status(404).json({ error: "Solicitud de préstamo no encontrada" });
  }

  const amortizationType = req.query.amortizationType || AMORTIZATION_TYPES.FRENCH;
  if (!Object.values(AMORTIZATION_TYPES).includes(amortizationType)) {
    return res.status(400).json({
      error: "amortizationType debe ser FRENCH o GERMAN",
    });
  }

  const schedule =
    amortizationType === AMORTIZATION_TYPES.GERMAN
      ? buildGermanSchedule(loan)
      : buildFrenchSchedule(loan);

  return res.json({
    loanId: loan.id,
    amortizationType,
    schedule,
  });
});

// PATCH /api/loans/:id/approve - aprueba una solicitud pendiente
router.patch("/:id/approve", (req, res) => {
  const loan = store.get(req.params.id);
  if (!loan) {
    return res.status(404).json({ error: "Solicitud de préstamo no encontrada" });
  }
  if (loan.status !== LOAN_STATUS.PENDING_APPROVAL) {
    return res.status(409).json({
      error: `No se puede aprobar una solicitud en estado ${loan.status}`,
    });
  }
  const updated = store.updateStatus(req.params.id, LOAN_STATUS.APPROVED, {
    approvedAt: new Date().toISOString(),
  });
  return res.json(updated);
});

// PATCH /api/loans/:id/reject - rechaza una solicitud pendiente
router.patch("/:id/reject", (req, res) => {
  const loan = store.get(req.params.id);
  if (!loan) {
    return res.status(404).json({ error: "Solicitud de préstamo no encontrada" });
  }
  if (loan.status !== LOAN_STATUS.PENDING_APPROVAL) {
    return res.status(409).json({
      error: `No se puede rechazar una solicitud en estado ${loan.status}`,
    });
  }
  const { reason } = req.body || {};
  const updated = store.updateStatus(req.params.id, LOAN_STATUS.REJECTED, {
    rejectedAt: new Date().toISOString(),
    reason: reason || "Sin motivo especificado",
  });
  return res.json(updated);
});

module.exports = router;
module.exports.store = store;
module.exports.LOAN_STATUS = LOAN_STATUS;
