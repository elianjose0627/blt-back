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
  inboundShippingNotifications,
  createToken
} from '../utils'
import InboundService from '../../services/jtl/InboundService'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string

describe('Inbound actions', () => {
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

  describe('Get inbound by id', () => {
    it('Should return 200 Success when an admin successfully retrieves an inbound by ID', async () => {
      const inboundId = faker.random.alphaNumeric(10)
      const mockInbound = {
        inboundId,
        fulfillerId: faker.random.alphaNumeric(4),
        items: [
          {
            inboundItemId: faker.random.numeric(4),
            jfsku: faker.random.alphaNumeric(10),
            quantity: 10,
            quantityOpen: 4,
            supplierSku: '',
            supplierProductName: '',
            note: ''
          },
          {
            inboundItemId: faker.random.numeric(4),
            jfsku: faker.random.alphaNumeric(10),
            quantity: 5,
            quantityOpen: -2,
            supplierSku: '',
            supplierProductName: '',
            note: ''
          }
        ],
        status: 'PartiallyReceipted',
        merchantInboundNumber: faker.random.numeric(4),
        warehouseId: faker.random.alphaNumeric(12),
        attributes: [],
        modificationInfo: {
          createdAt: '2024-07-18T10:00:14.167+00:00',
          updatedAt: '2024-07-24T12:57:28.429+00:00',
          state: 'Modified'
        },
        supplier: {
          merchantSupplierName: faker.lorem.word(),
          merchantSupplierNumber: faker.random.alphaNumeric(4)
        }
      }

      const getInboundStub = sinon.stub(InboundService.prototype, 'getInbound')
      getInboundStub.resolves(mockInbound)

      const res = await chai
        .request(app)
        .get(`/api/inbounds/${inboundId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      getInboundStub.restore()
      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'inbound')
      expect(res.body.inbound).to.be.an('object')
      expect(res.body.inbound.inboundId).to.equal(inboundId)
    })

    it('Should return 200 Success when an admin successfully retrieves shipping notifications for an inbound', async () => {
      const inboundId = faker.random.alphaNumeric(10)
      const mockShippingNotificationsResponse = inboundShippingNotifications

      const getShippingNotificationsStub = sinon.stub(InboundService.prototype, 'getShippingNotifications')
      getShippingNotificationsStub.resolves(mockShippingNotificationsResponse)

      const res = await chai
        .request(app)
        .get(`/api/inbounds/${inboundId}/shipping-notifications`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      getShippingNotificationsStub.restore()
      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'shippingNotifications')
      expect(res.body.shippingNotifications).to.be.an('array')
      expect(res.body.shippingNotifications[0]).to.include.keys('inboundShippingNotificationId', 'merchantInboundNumber', 'inboundId', 'fulfillerId', 'items', 'packages')
    })

    it('Should return 401 Unauthorized when an admin tries to retrieve an inbound by ID with an invalid access token from the db', async () => {
      const inboundId = 'VZ9N03LD66'

      const res = await chai
        .request(app)
        .get(`/api/inbounds/${inboundId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Request failed with status code 401')
    })

    it('Should return 401 Unauthorized when an admin tries to retrieve shipping notifications for an inbound with an invalid access token from the db', async () => {
      const inboundId = 'VZ9N03LD66'
      const res = await chai
        .request(app)
        .get(`/api/inbounds/${inboundId}/shipping-notifications`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Request failed with status code 401')
    })
  })
})
