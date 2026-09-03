const { buildAmortizationSchedule } = require("../src/services/interestCalculator");

describe("Calculadora de intereses — tabla de amortización", () => {
  test("genera el número correcto de cuotas", () => {
    const { schedule } = buildAmortizationSchedule(12000, 12, 0.24);
    expect(schedule).toHaveLength(12);
  });

  test("el saldo final es 0 (o muy cercano por redondeo)", () => {
    const { schedule } = buildAmortizationSchedule(10000, 24, 0.18);
    const last = schedule[schedule.length - 1];
    expect(last.remainingBalance).toBeLessThanOrEqual(0.5);
  });

  test("con tasa 0% la cuota es el monto entre los meses", () => {
    const { monthlyPayment } = buildAmortizationSchedule(6000, 6, 0);
    expect(monthlyPayment).toBeCloseTo(1000, 2);
  });

  test("la cuota mensual es constante en todo el plazo", () => {
    const { schedule, monthlyPayment } = buildAmortizationSchedule(5000, 10, 0.12);
    schedule.forEach((row) => {
      expect(row.payment).toBeCloseTo(monthlyPayment, 2);
    });
  });
});
