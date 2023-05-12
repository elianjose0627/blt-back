import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  createPrivacyRule,
  createCompanyAdministratorWithCompany
} from '../utils'
import * as userRoles from '../../utils/userRoles'
import * as appModules from '../../utils/appModules'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string

describe('Privacy Rule actions', () => {
  before(async () => {
    await createAdminTestUser()
    await createCompanyAdministratorWithCompany()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustriesmarvel.com', phone: '254720123456', password: 'mackone' } })

    await verifyUser('shehulk@starkindustriesmarvel.com')

    const resUser = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: 'mackone' } })

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: 'thebiggun' } })

    const resCompanyAdminTwo = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'sharoncarter@starkindustriesmarvel.com', password: 'thepowerbroker' } })

    await createPrivacyRule(resCompanyAdminTwo.body.user.company.id, appModules.ORDERS, userRoles.COMPANYADMINISTRATOR)

    tokenAdmin = resAdmin.body.token
    token = resUser.body.token
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Get all privacy rules', () => {
    it('Should return 200 Success when an admin successfully retrieves all privacy rules.', async () => {
      const res = await chai
        .request(app)
        .get('/api/privacy-rules')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'privacyRules')
      expect(res.body.privacyRules).to.be.an('array')
    })

    it('Should return 403 when a non-admin retrieves all privacy rules.', async () => {
      const res = await chai
        .request(app)
        .get('/api/privacy-rules')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })
})
