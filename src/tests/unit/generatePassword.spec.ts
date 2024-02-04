import chai from 'chai'
import sinonChai from 'sinon-chai'
import generatePassword from '../../utils/generatePassword'

const { expect } = chai

chai.use(sinonChai)

describe('Generate password of random lengths', () => {
  for (let length = 1; length <= 20; length++) {
    it(`tests if passwords of length ${length} are generated`, () => {
      const password = generatePassword(length)
      expect(password).to.be.of.length(length)
    })
  }
})

describe('Generate password of length 8', () => {
  for (let i = 0; i < 20; i++) {
    it('tests if passwords of length 8 are generated', () => {
      const password = generatePassword(8)
      expect(password).to.be.a('string')
      expect(password).to.have.lengthOf(8)
    })
  }
})
