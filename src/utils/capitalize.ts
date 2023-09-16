const capitalize = (name: string): string => name.toLowerCase()
  .replace(/\s+/g, ' ')
  .replace(/(^|\s|'|-)\S/g, s => s.toUpperCase())
  .replace(/ng'[A,E,I,O,U]/g, s => s.toLowerCase())
  .replace(/Ng'[A,E,I,O,U]/g, s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
  .replace(/Mc[a-z]/g, s => s.charAt(0).toUpperCase() + s.charAt(1).toLowerCase() + s.charAt(2).toUpperCase())
  .replace(/Mac[^aeiou]/g, s => s.charAt(0).toUpperCase() + s.charAt(1).toLowerCase() + s.charAt(2).toLowerCase() + s.charAt(3).toUpperCase())
  .replace(/V(?![ander|anessa])[a,o]n[a-z]/g, s => s.charAt(0).toUpperCase() + s.charAt(1).toLowerCase() + s.charAt(2).toLowerCase() + s.charAt(3).toUpperCase())
  .trim()

export default capitalize
