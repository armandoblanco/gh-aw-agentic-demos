const { randomUUID } = require("crypto");

const LOAN_STATUS = Object.freeze({
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
});

/**
 * Almacén en memoria de solicitudes de préstamo.
 * Suficiente para una demo; en producción esto sería una base de datos real.
 */
class LoanStore {
  constructor() {
    this.loans = new Map();
  }

  create({ customerId, amount, termMonths, annualInterestRate }) {
    const loan = {
      id: randomUUID(),
      customerId,
      amount,
      termMonths,
      annualInterestRate,
      status: LOAN_STATUS.PENDING_APPROVAL,
      createdAt: new Date().toISOString(),
    };
    this.loans.set(loan.id, loan);
    return loan;
  }

  list() {
    return Array.from(this.loans.values());
  }

  get(id) {
    return this.loans.get(id);
  }

  updateStatus(id, status, extra = {}) {
    const loan = this.loans.get(id);
    if (!loan) return undefined;
    Object.assign(loan, { status }, extra);
    return loan;
  }

  clear() {
    this.loans.clear();
  }
}

module.exports = { LoanStore, LOAN_STATUS };
