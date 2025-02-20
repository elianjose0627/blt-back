import chai from 'chai'
import sinonChai from 'sinon-chai'
import * as userRoles from '../../utils/userRoles'
import generateMagicLink from '../../utils/generateMagicLink'

const { expect } = chai

chai.use(sinonChai)

describe('generate Magic Link', () => {
  it('should return a magic link', () => {
    const user = {
      id: 'b686e980-e928-11ea-9732-ebb399168cb4',
      email: 'guesmia.tech@gmail.com',
      role: userRoles.ADMIN
    }

    const token = generateMagicLink(user.id)

    expect(token).to.be.a('string')
  })
})
