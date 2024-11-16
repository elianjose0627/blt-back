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

  describe('Get outbound by id', () => {
    it('Should return 200 Success when an admin successfully retrieves an outbound by ID', async () => {
      const outboundId = faker.random.alphaNumeric(10)
      const mockOutbound = {
        outboundId,
        fulfillerId: faker.random.alphaNumeric(4),
        externalNumber: faker.random.alphaNumeric(15),
        status: 'Shipped',
        priority: 0,
        merchantOutboundNumber: faker.random.alphaNumeric(10),
        warehouseId: faker.random.alphaNumeric(15),
        currency: 'EUR',
        externalNote: faker.lorem.sentence(),
        salesChannel: 'RestAPI',
        attributes: [],
        shippingMethodId: faker.random.alphaNumeric(15),
        shippingType: 'Standard',
        shippingAddress: {
          firstname: faker.name.firstName(),
          lastname: faker.name.lastName(),
          street: faker.address.streetAddress(),
          city: faker.address.city(),
          zip: faker.address.zipCode(),
          country: faker.address.countryCode(),
          email: faker.internet.email()
        },
        senderAddress: {
          company: faker.company.name(),
          street: faker.address.streetAddress(),
          city: faker.address.city(),
          zip: faker.address.zipCode(),
          country: faker.address.countryCode(),
          email: faker.internet.email(),
          phone: faker.phone.number()
        },
        shippingFee: 0,
        orderValue: 0,
        items: [
          {
            outboundItemId: faker.random.alphaNumeric(6),
            jfsku: faker.random.alphaNumeric(10),
            itemType: 'Product',
            quantity: 1,
            quantityOpen: 0,
            name: faker.commerce.productName(),
            merchantSku: faker.random.alphaNumeric(10),
            externalNumber: '',
            price: 0,
            vat: 0
          }
        ],
        attachments: [],
        modificationInfo: {
          createdAt: '2024-10-28T11:27:33.382+00:00',
          updatedAt: '2024-10-28T14:13:28.329+00:00',
          state: 'Modified'
        },
        statusTimestamp: {
          pending: '2024-10-28T11:27:37.137+00:00',
          preparation: '2024-10-28T11:27:33.380+00:00',
          acknowledged: '2024-10-28T11:29:15.578+00:00',
          pickprocess: '2024-10-28T12:55:27.436+00:00',
          shipped: '2024-10-28T14:13:28.323+00:00'
        }
      }

      const getOutboundStub = sinon.stub(OutboundService.prototype, 'getOutbound')
      getOutboundStub.resolves(mockOutbound)

      const res = await chai
        .request(app)
        .get(`/api/outbounds/${outboundId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      getOutboundStub.restore()
      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'outbound')
      expect(res.body.outbound).to.be.an('object')
      expect(res.body.outbound.outboundId).to.equal(outboundId)
    })

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

    it('Should return 401 Unauthorized when an admin tries to retrieve an outbound by ID with an invalid access token from the db', async () => {
      const outboundId = 'VZ9N02AI5Q'

      const res = await chai
        .request(app)
        .get(`/api/outbounds/${outboundId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Request failed with status code 401')
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
