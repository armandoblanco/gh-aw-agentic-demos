/**
 * Calcula la tabla de amortización de un préstamo usando el sistema
 * francés (cuota fija mensual).
 *
 * @param {number} amount - Monto principal del préstamo.
 * @param {number} termMonths - Plazo en meses.
 * @param {number} annualInterestRate - Tasa de interés anual (ej. 0.18 = 18%).
 * @returns {{ monthlyPayment: number, schedule: Array<object> }}
 */
function buildAmortizationSchedule(amount, termMonths, annualInterestRate) {
  const monthlyRate = annualInterestRate / 12;
  const monthlyPayment =
    monthlyRate === 0
      ? amount / termMonths
      : (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));

  let balance = amount;
  const schedule = [];

  for (let month = 1; month <= termMonths; month += 1) {
    const interestPortion = balance * monthlyRate;
    const principalPortion = monthlyPayment - interestPortion;
    balance -= principalPortion;

    schedule.push({
      month,
      payment: round2(monthlyPayment),
      principal: round2(principalPortion),
      interest: round2(interestPortion),
      remainingBalance: round2(Math.max(balance, 0)),
    });
  }

  return { monthlyPayment: round2(monthlyPayment), schedule };
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

module.exports = { buildAmortizationSchedule };
