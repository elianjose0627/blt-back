import chai from 'chai'
import sinonChai from 'sinon-chai'
import { v1 as uuidv1 } from 'uuid'
import { encryptUUID } from '../../utils/encryption'

const { expect } = chai

chai.use(sinonChai)

describe('Encrypt UUID', () => {
  it('Should encrypt UUID with IV', () => {
    const encryptedUUID = encryptUUID(uuidv1(), 'base64', uuidv1())
    expect(encryptedUUID).to.be.a('string')
  })
})
