import { faker } from '@faker-js/faker'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import capitalize from '../../utils/capitalize'

const { expect } = chai

chai.use(sinonChai)

describe('capitalize', () => {
  it('tests if full name is capitalized', () => {
    const capitalizedname = capitalize('test user')
    expect(capitalizedname).to.equal('Test User')
  })

  it('tests if random first and last names are capitalized', () => {
    const firstName = String(faker.name.firstName())
    const lastName = String(faker.name.lastName())
    const capitalizedname = capitalize(`${firstName} ${lastName}`)
    expect(capitalizedname).to.equal(`${firstName} ${lastName}`)
  })

  it('tests if last name with apostrophe is capitalized', () => {
    const capitalizedname = capitalize('O\'Conner')
    expect(capitalizedname).to.equal('O\'Conner')
  })

  it('tests if Clemmie McKenzie is capitalized correctly', () => {
    const capitalizedname = capitalize('Clemmie McKenzie')
    expect(capitalizedname).to.equal('Clemmie McKenzie')
  })

  it('tests if Doug McGlynn is capitalized correctly', () => {
    const capitalizedname = capitalize('Doug McGlynn')
    expect(capitalizedname).to.equal('Doug McGlynn')
  })

  it('tests if Sabryna MacGyver is capitalized correctly', () => {
    const capitalizedname = capitalize('Sabryna MacGyver')
    expect(capitalizedname).to.equal('Sabryna MacGyver')
  })

  it('tests if Zora VonRueden is capitalized correctly', () => {
    const capitalizedname = capitalize('Zora VonRueden')
    expect(capitalizedname).to.equal('Zora VonRueden')
  })

  it('tests if first name with a mixture of upper and lower case letters is capitalized', () => {
    const capitalizedname = capitalize('rYAn')
    expect(capitalizedname).to.equal('Ryan')
  })

  it('tests if full name with a mixture of upper and lower case letters is capitalized', () => {
    const capitalizedname = capitalize('rYAn wIrE')
    expect(capitalizedname).to.equal('Ryan Wire')
  })

  it('tests if full name with a mixture of upper and lower case letters is capitalized', () => {
    const capitalizedname = capitalize('Oceane Macejkovic')
    expect(capitalizedname).to.equal('Oceane Macejkovic')
  })

  it('tests if full name with a mixture of upper and lower case letters is capitalized', () => {
    const capitalizedname = capitalize('Harmon Vandervort')
    expect(capitalizedname).to.equal('Harmon Vandervort')
  })

  it('tests if full name with hyphens in first and last name is capitalized', () => {
    const capitalizedname = capitalize('shelly-ann fraser-pryce')
    expect(capitalizedname).to.equal('Shelly-Ann Fraser-Pryce')
  })

  it('tests if full name is capitalized', () => {
    const capitalizedname = capitalize('Mackenzie Towne')
    expect(capitalizedname).to.equal('MacKenzie Towne')
  })

  it('tests if full name with apostrophe in last name is capitalized', () => {
    const capitalizedname = capitalize('lupita nyong\'o')
    expect(capitalizedname).to.equal('Lupita Nyong\'o')
  })

  it('tests if full name with two apostrophes in last name is capitalized', () => {
    const capitalizedname = capitalize('george ng\'ang\'a')
    expect(capitalizedname).to.equal('George Ng\'ang\'a')
  })

  it('tests if name with umlaut is capitalized', () => {
    const capitalizedname = capitalize('Köhn')
    expect(capitalizedname).to.equal('Köhn')
  })

  it('tests if name with umlaut is capitalized', () => {
    const capitalizedname = capitalize('Rischmüller')
    expect(capitalizedname).to.equal('Rischmüller')
  })

  it('tests if name with umlaut is capitalized', () => {
    const capitalizedname = capitalize('Rimböck')
    expect(capitalizedname).to.equal('Rimböck')
  })
})
