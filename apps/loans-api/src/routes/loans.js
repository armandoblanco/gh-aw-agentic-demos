const express = require("express");
const { LoanStore, LOAN_STATUS } = require("../models/loanStore");
const { buildAmortizationSchedule } = require("../services/interestCalculator");

const router = express.Router();
const store = new LoanStore();

function validateLoanInput({ customerId, amount, termMonths, annualInterestRate }) {
  const errors = [];
  if (!customerId || typeof customerId !== "string") {
    errors.push("customerId es requerido y debe ser texto");
  }
  if (typeof amount !== "number" || amount <= 0) {
    errors.push("amount debe ser un número mayor que 0");
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

// GET /api/loans/:id/schedule - calcula la tabla de amortización
router.get("/:id/schedule", (req, res) => {
  const loan = store.get(req.params.id);
  if (!loan) {
    return res.status(404).json({ error: "Solicitud de préstamo no encontrada" });
  }
  const { monthlyPayment, schedule } = buildAmortizationSchedule(
    loan.amount,
    loan.termMonths,
    loan.annualInterestRate
  );
  return res.json({ loanId: loan.id, monthlyPayment, schedule });
});

module.exports = router;
module.exports.store = store;
module.exports.LOAN_STATUS = LOAN_STATUS;
