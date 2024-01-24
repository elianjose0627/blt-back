const generatePassword = (length: number): string => {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
  const numericChars = '0123456789'
  const specialChars = '!@#$%^&*()-=_+[]{}|;:,.<>?'

  const allChars = uppercaseChars + lowercaseChars + numericChars + specialChars

  let password = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length)
    password += allChars.charAt(randomIndex)
  }

  return password
}

export default generatePassword
