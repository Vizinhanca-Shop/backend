export const cellphoneRegex = /^(\+[1-9]{1}[0-9]{3,14})?([0-9]{9,14})$/
export const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA  -Z0-9.-]+\.[a-zA-Z]{2,4}$/
export const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
export const validateCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]+/g, '') // Remove any non-numeric characters

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false // Invalid length or repeated digits (e.g., 111.111.111-11)
  }

  let sum
  let remainder

  // Validate first digit
  sum = 0
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) {
    remainder = 0
  }
  if (remainder !== parseInt(cpf.substring(9, 10))) {
    return false
  }

  // Validate second digit
  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) {
    remainder = 0
  }
  if (remainder !== parseInt(cpf.substring(10, 11))) {
    return false
  }

  return true
}
