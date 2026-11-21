export const SERVICE_FEE_RATE = 0.055

export function roundToCents(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

export function calcOrderTotal(price) {
  const roundedPrice = roundToCents(price)
  const serviceFee = roundToCents(roundedPrice * SERVICE_FEE_RATE)

  return {
    price: roundedPrice,
    serviceFee,
    total: roundToCents(roundedPrice + serviceFee),
  }
}
