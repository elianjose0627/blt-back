import chai from 'chai'
import chaiHttp from 'chai-http'
import sinon from 'sinon'
import { faker } from '@faker-js/faker'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  createCompanyAdministratorWithCompany,
  iversAtKreeDotKrPassword,
  sheHulkAtStarkIndustriesPassword,
  outboundShippingNotifications,
  createToken
} from '../utils'
import OutboundService from '../../services/jtl/OutboundService'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string

describe('Outbound actions', () => {
  before(async () => {
    await createAdminTestUser()
    await createCompanyAdministratorWithCompany()
    await createToken()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustriesmarvel.com', phone: '254720123456', password: sheHulkAtStarkIndustriesPassword } })

    await verifyUser('shehulk@starkindustriesmarvel.com')

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: iversAtKreeDotKrPassword } })

    tokenAdmin = resAdmin.body.token
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Get outbound shipping notifications', () => {
    it('Should return 200 Success when an admin successfully retrieves shipping notifications for an outbound', async () => {
      const outboundId = faker.random.alphaNumeric(10)
      const mockShippingNotificationsResponse = outboundShippingNotifications

      const getShippingNotificationsStub = sinon.stub(OutboundService.prototype, 'getShippingNotifications')
      getShippingNotificationsStub.resolves(mockShippingNotificationsResponse)

      const res = await chai
        .request(app)
        .get(`/api/outbounds/${outboundId}/shipping-notifications`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      getShippingNotificationsStub.restore()
      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'shippingNotifications')
      expect(res.body.shippingNotifications).to.be.an('array')
      expect(res.body.shippingNotifications[0]).to.include.keys('outboundShippingNotificationId', 'merchantOutboundNumber', 'outboundId', 'fulfillerId', 'items', 'packages')
    })

    it('Should return 401 Unauthorized when an admin tries to retrieve shipping notifications for an outbound with an invalid access token from the db', async () => {
      const outboundId = 'VZ9N02AI5Q'
      const res = await chai
        .request(app)
        .get(`/api/outbounds/${outboundId}/shipping-notifications`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Request failed with status code 401')
    })
  })
})
