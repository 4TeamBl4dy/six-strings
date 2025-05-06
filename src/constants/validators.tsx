import validator from 'validator'

export const isValidPhone = (value: string) => {
  return value.startsWith('+7') && /^[0-9+() -]+$/.test(value) && value.length === 18
}
export const PHONE_MASK = '+7 (999) 999-99-99'

export const isStrongPassword = (value: string) => {
  return validator.isStrongPassword(value, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
}