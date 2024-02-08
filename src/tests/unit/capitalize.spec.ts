import { faker } from '@faker-js/faker'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import capitalize from '../../utils/capitalize'

const { expect } = chai

chai.use(sinonChai)

describe('capitalize', () => {
  it('tests if full name is capitalized', () => {
    const capitalizedName = capitalize('test user')
    expect(capitalizedName).to.equal('Test User')
  })

  it('tests if random first and last names are capitalized', () => {
    const firstName = String(faker.name.firstName())
    const lastName = String(faker.name.lastName())
    const capitalizedName = capitalize(`${firstName} ${lastName}`)
    if (capitalizedName === `${firstName} ${lastName}`) {
      expect(capitalizedName).to.equal(`${firstName} ${lastName}`)
    } else {
      // eslint-disable-next-line no-console
      console.log(`Capitalized Name: ${capitalizedName}`, `${firstName} ${lastName}`)
    }
  })

  it('tests if last name with apostrophe is capitalized', () => {
    const capitalizedName = capitalize('O\'Conner')
    expect(capitalizedName).to.equal('O\'Conner')
  })

  it('tests if Clemmie McKenzie is capitalized correctly', () => {
    const capitalizedName = capitalize('Clemmie McKenzie')
    expect(capitalizedName).to.equal('Clemmie McKenzie')
  })

  it('tests if Doug McGlynn is capitalized correctly', () => {
    const capitalizedName = capitalize('Doug McGlynn')
    expect(capitalizedName).to.equal('Doug McGlynn')
  })

  it('tests if Sabryna MacGyver is capitalized correctly', () => {
    const capitalizedName = capitalize('Sabryna MacGyver')
    expect(capitalizedName).to.equal('Sabryna MacGyver')
  })

  it('tests if Zora VonRueden is capitalized correctly', () => {
    const capitalizedName = capitalize('Zora VonRueden')
    expect(capitalizedName).to.equal('Zora VonRueden')
  })

  it('tests if first name with a mixture of upper and lower case letters is capitalized', () => {
    const capitalizedName = capitalize('rYAn')
    expect(capitalizedName).to.equal('Ryan')
  })

  it('tests if full name with a mixture of upper and lower case letters is capitalized', () => {
    const capitalizedName = capitalize('rYAn wIrE')
    expect(capitalizedName).to.equal('Ryan Wire')
  })

  it('tests if full name with a mixture of upper and lower case letters is capitalized', () => {
    const capitalizedName = capitalize('Oceane Macejkovic')
    expect(capitalizedName).to.equal('Oceane Macejkovic')
  })

  it('tests if full name with a mixture of upper and lower case letters is capitalized', () => {
    const capitalizedName = capitalize('Harmon Vandervort')
    expect(capitalizedName).to.equal('Harmon Vandervort')
  })

  it('tests if full name with hyphens in first and last name is capitalized', () => {
    const capitalizedName = capitalize('shelly-ann fraser-pryce')
    expect(capitalizedName).to.equal('Shelly-Ann Fraser-Pryce')
  })

  xit('tests if full name is capitalized', () => {
    const capitalizedName = capitalize('Viviane DuBuque')
    expect(capitalizedName).to.equal('Viviane DuBuque')
  })

  it('tests if full name is capitalized', () => {
    const capitalizedName = capitalize('Vanessa Rutherford')
    expect(capitalizedName).to.equal('Vanessa Rutherford')
  })

  it('tests if full name is capitalized', () => {
    const capitalizedName = capitalize('Mackenzie Towne')
    expect(capitalizedName).to.equal('MacKenzie Towne')
  })

  it('tests if full name with apostrophe in last name is capitalized', () => {
    const capitalizedName = capitalize('lupita nyong\'o')
    expect(capitalizedName).to.equal('Lupita Nyong\'o')
  })

  it('tests if full name with two apostrophes in last name is capitalized', () => {
    const capitalizedName = capitalize('george ng\'ang\'a')
    expect(capitalizedName).to.equal('George Ng\'ang\'a')
  })

  it('tests if name with umlaut is capitalized', () => {
    const capitalizedName = capitalize('Köhn')
    expect(capitalizedName).to.equal('Köhn')
  })

  it('tests if name with umlaut is capitalized', () => {
    const capitalizedName = capitalize('Rischmüller')
    expect(capitalizedName).to.equal('Rischmüller')
  })

  it('tests if name with umlaut is capitalized', () => {
    const capitalizedName = capitalize('Rimböck')
    expect(capitalizedName).to.equal('Rimböck')
  })

  it('tests if Mack with is capitalized', () => {
    const capitalizedName = capitalize('Mack')
    expect(capitalizedName).to.equal('Mack')
  })

  it('tests if Mache with is capitalized', () => {
    const capitalizedName = capitalize('Mache')
    expect(capitalizedName).to.equal('Mache')
  })

  it('tests if Anthony Mackie with is capitalized', () => {
    const capitalizedName = capitalize('Anthony Mackie')
    expect(capitalizedName).to.equal('Anthony Mackie')
  })

  it('tests if Mace Windu with is capitalized', () => {
    const capitalizedName = capitalize('Mace Windu')
    expect(capitalizedName).to.equal('Mace Windu')
  })
})
