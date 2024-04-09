export const replacePlaceholders = (template: string, replacements: {[key: string]: string }): string => {
  let result = template
  for (const [placeholder, value] of Object.entries(replacements)) {
    const regex = new RegExp(`\\[${placeholder}\\]`, 'g')
    result = result.replace(regex, value)
  }
  return result
}
