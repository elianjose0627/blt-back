import chai from 'chai'
import sinonChai from 'sinon-chai'
import generateToken from '../../utils/generateToken'
import * as userRoles from '../../utils/userRoles'

const { expect } = chai

chai.use(sinonChai)

describe('generateToken', () => {
  it('should return a token', () => {
    const user = {
      id: 'b686e980-e928-11ea-9732-ebb399168cb4',
      email: 'simiyuwire@gmail.com',
      role: userRoles.ADMIN,
      isVerified: true,
      logoutTime: '2020-08-28T12:19:25.850Z'
    }
    const type = 'login'
    const expiresIn = '1 minute'

    const token = generateToken(user, type, expiresIn)

    expect(token).to.be.a('string')
  })

  it('should return a token when expiresIn is not set', () => {
    const user = {
      id: 'b686e980-e928-11ea-9732-ebb399168cb4',
      email: 'simiyuwire@gmail.com',
      role: userRoles.ADMIN,
      isVerified: true,
      logoutTime: '2020-08-28T12:19:25.850Z'
    }
    const type = 'login'

    const token = generateToken(user, type)

    expect(token).to.be.a('string')
  })
})
