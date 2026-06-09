const UNIT_TO_KG = {
  kg: 1,
  portions: 0.35,
  boxes: 2,
  litres: 1,
};

const estimateImpact = (quantity, unit) => {
  const quantityKg = (quantity || 0) * (UNIT_TO_KG[unit] || 0.35);
  const mealsEstimate = Math.round(quantityKg / 0.35);
  const co2SavedKg = Math.round(quantityKg * 2.5 * 100) / 100;
  return { quantityKg, mealsEstimate, co2SavedKg };
};

module.exports = { estimateImpact, UNIT_TO_KG };
