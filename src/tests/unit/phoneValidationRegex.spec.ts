import chai from 'chai'
import sinonChai from 'sinon-chai'
import { phoneValidationPattern } from '../../constants/regexPatterns'

const { expect } = chai

chai.use(sinonChai)

const validatePhoneNumber = (phoneNumber: string): boolean => {
  return phoneValidationPattern.test(phoneNumber)
}

describe('Phone validation regex', () => {
  it('tests if phone number is valid 1', () => {
    const isValid = validatePhoneNumber('+4911111111111')
    expect(isValid).to.equal(true)
  })
  it('tests if phone number is valid 2', () => {
    const isValid = validatePhoneNumber('011111111111')
    expect(isValid).to.equal(true)
  })
  it('tests if phone number is valid 3', () => {
    const isValid = validatePhoneNumber('01111111010')
    expect(isValid).to.equal(true)
  })
  it('tests if phone number is valid 4', () => {
    const isValid = validatePhoneNumber('0111 11111111')
    expect(isValid).to.equal(true)
  })
  it('tests if phone number is valid 5', () => {
    const isValid = validatePhoneNumber('0152-11100011')
    expect(isValid).to.equal(true)
  })
  it('tests if phone number is valid 6', () => {
    const isValid = validatePhoneNumber('+49 17111111111')
    expect(isValid).to.equal(true)
  })
  it('tests if phone number is valid 7', () => {
    const isValid = validatePhoneNumber('+49 176 88888888')
    expect(isValid).to.equal(true)
  })
  it('tests if phone number is valid 8', () => {
    const isValid = validatePhoneNumber('040 111000100')
    expect(isValid).to.equal(true)
  })
  it('tests if phone number is valid 9', () => {
    const isValid = validatePhoneNumber('+49 111 11 00 11 11')
    expect(isValid).to.equal(true)
  })
  it('tests if phone number is valid 10', () => {
    const isValid = validatePhoneNumber('00111222333444')
    expect(isValid).to.equal(true)
  })
  it('tests if phone number is valid 11', () => {
    const isValid = validatePhoneNumber('(123) 456-7890')
    expect(isValid).to.equal(true)
  })
  it('tests if phone number is valid 12', () => {
    const isValid = validatePhoneNumber('123-456-7890')
    expect(isValid).to.equal(true)
  })
  it('tests if phone number is valid 13', () => {
    const isValid = validatePhoneNumber('123.456.7890')
    expect(isValid).to.equal(true)
  })
  it('tests if phone number is valid 14', () => {
    const isValid = validatePhoneNumber('075-63546725')
    expect(isValid).to.equal(true)
  })
  it('tests if phone number is valid 15', () => {
    const isValid = validatePhoneNumber('075-6a3546725')
    expect(isValid).to.equal(false)
  })
  it('tests if phone number is valid 16', () => {
    const isValid = validatePhoneNumber('abc')
    expect(isValid).to.equal(false)
  })
})
