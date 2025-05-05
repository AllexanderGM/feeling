export const normalizeWords = text => {
  const replacements = {
    Montania: 'Montaña',
    Espania: 'España'
  }

  return replacements[text] || text
}
