export function findPackage(packages, idOrTier) {
  if (!idOrTier) return null
  const value = String(idOrTier)
  return packages.find((pkg) => pkg.id === value || pkg.tier === value.toUpperCase()) || null
}
