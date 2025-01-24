import chai from 'chai'
import chaiHttp from 'chai-http'
import { faker } from '@faker-js/faker'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  createCompanyAdministrator,
  createCompanyAdministratorWithCompany,
  order,
  createPrivacyRule,
  createCompanyOrder,
  createCompanyOrderWithMissingEmail,
  createCompanyOrderWithMissingCityStreetZip,
  createCompanyOrderWithMinimalShippingAddress,
  iversAtKreeDotKrPassword,
  nickFuryPassword,
  sheHulkAtStarkIndustriesPassword,
  sharonCarterPassword
} from '../utils'
import * as userRoles from '../../utils/userRoles'
import * as appModules from '../../utils/appModules'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let tokenCompanyAdmin: string
let tokenCompanyAdminTwo: string
let token: string

describe('Order actions', () => {
  before(async () => {
    await createAdminTestUser()
    await createCompanyAdministrator()
    await createCompanyAdministratorWithCompany()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustriesmarvel.com', phone: '254720123456', password: sheHulkAtStarkIndustriesPassword } })

    await verifyUser('shehulk@starkindustriesmarvel.com')

    const resUser = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: sheHulkAtStarkIndustriesPassword } })

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: iversAtKreeDotKrPassword } })

    const resCompanyAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

    const resCompanyAdminTwo = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'sharoncarter@starkindustriesmarvel.com', password: sharonCarterPassword } })

    await createPrivacyRule(resCompanyAdminTwo.body.user.company.id, appModules.ORDERS, userRoles.COMPANYADMINISTRATOR)
    await createCompanyOrder(resCompanyAdminTwo.body.user.company.id)
    await createCompanyOrderWithMissingEmail(resCompanyAdminTwo.body.user.company.id)
    await createCompanyOrderWithMissingCityStreetZip(resCompanyAdminTwo.body.user.company.id)
    await createCompanyOrderWithMinimalShippingAddress(resCompanyAdminTwo.body.user.company.id)

    tokenAdmin = resAdmin.body.token
    token = resUser.body.token
    tokenCompanyAdmin = resCompanyAdmin.body.token
    tokenCompanyAdminTwo = resCompanyAdminTwo.body.token
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Create an order', () => {
    it('Should return 201 Created when an admin creates an order.', async () => {
      const res = await chai
        .request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          order
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'order')
      expect(res.body.order).to.be.an('object')
      expect(res.body.order).to.include.keys('id', 'outboundId', 'fulfillerId', 'merchantOutboundNumber', 'status', 'shippingAddress', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an admin creates the same order.', async () => {
      const res = await chai
        .request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          order
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'order')
      expect(res.body.order).to.be.an('object')
      expect(res.body.order).to.include.keys('id', 'outboundId', 'fulfillerId', 'merchantOutboundNumber', 'status', 'shippingAddress', 'createdAt', 'updatedAt')
    })
  })

  describe('Get all orders', () => {
    it('Should return 200 OK when a user gets orders.', async () => {
      const res = await chai
        .request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orders', 'meta')
      expect(res.body.orders).to.be.an('array')
      expect(res.body.meta.pageCount).to.be.a('number')
    })

    it('Should return 200 OK when an admin gets all orders.', async () => {
      const res = await chai
        .request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orders', 'meta')
      expect(res.body.orders).to.be.an('array')
      expect(res.body.meta.pageCount).to.be.a('number')
    })

    it('Should return 200 OK when a company admin gets all orders.', async () => {
      const res = await chai
        .request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${tokenCompanyAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orders', 'meta')
      expect(res.body.orders).to.be.an('array')
      expect(res.body.meta.pageCount).to.be.a('number')
    })

    it('Should return 200 OK when a company admin gets all orders with search params.', async () => {
      const res = await chai
        .request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${tokenCompanyAdmin}`)
        .query({
          limit: 10,
          page: 1,
          search: 'Ryan'
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orders', 'meta')
      expect(res.body.orders).to.be.an('array')
      expect(res.body.meta.pageCount).to.be.a('number')
    })

    it('Should return 200 OK when a company admin gets all orders with filter params.', async () => {
      const res = await chai
        .request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${tokenCompanyAdmin}`)
        .query({
          limit: 10,
          page: 1,
          'filter[firstname]': 'Ryan',
          'filter[lastname]': 'Wire',
          'filter[email]': 'ryan@email.com',
          'filter[city]': 'Nairobi',
          'filter[country]': 'KE'
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orders', 'meta')
      expect(res.body.orders).to.be.an('array')
      expect(res.body.meta.pageCount).to.be.a('number')
    })

    it('Should return 200 OK when a company admin gets all orders with search and filter params.', async () => {
      const res = await chai
        .request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${tokenCompanyAdmin}`)
        .query({
          limit: 10,
          page: 1,
          search: 'Ryan',
          'filter[firstname]': 'Ryan',
          'filter[lastname]': 'Wire',
          'filter[email]': 'ryan@email.com',
          'filter[city]': 'Nairobi',
          'filter[country]': 'KE'
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orders', 'meta')
      expect(res.body.orders).to.be.an('array')
      expect(res.body.meta.pageCount).to.be.a('number')
    })

    it('Should return 422 Unprocessable entity  when a company admin gets all orders with wrong filter params.', async () => {
      const res = await chai
        .request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${tokenCompanyAdmin}`)
        .query({
          limit: 10,
          page: 1,
          'filter[firstname1]': 'Ryan',
          'filter[lastname]': 'Wire',
          'filter[email]': 'ryan@email.com',
          'filter[city]': 'Nairobi',
          'filter[country]': 'KE'
        })

      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('A validation error has occurred')
    })

    it('Should return 200 OK when a company admin gets all orders with a privacy rule set.', async () => {
      const res = await chai
        .request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orders', 'meta')
      expect(res.body.orders).to.be.an('array')
      expect(res.body.meta.pageCount).to.be.a('number')
    })

    it('Should return 200 OK when a company admin gets all orders with a privacy rule set and missing email in shipping.', async () => {
      const res = await chai
        .request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orders', 'meta')
      expect(res.body.orders).to.be.an('array')
      expect(res.body.meta.pageCount).to.be.a('number')
    })

    it('Should return 200 OK when a company admin gets all orders with a privacy rule set and missing city, street and zip in shipping.', async () => {
      const res = await chai
        .request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orders', 'meta')
      expect(res.body.orders).to.be.an('array')
      expect(res.body.meta.pageCount).to.be.a('number')
    })
  })

  describe('Update an order', () => {
    it('Should return 200 OK when an admin updates an order.', async () => {
      const resOrder = await chai
        .request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          order: {
            outboundId: 'VZ9N02ZZY4',
            fulfillerId: 'NDZ2',
            merchantOutboundNumber: 'AU-2024-21635-001',
            warehouseId: 'NDZ204DE-12589-0002',
            status: 'Acknowledged',
            shippingAddress: {
              lastname: faker.name.lastName(),
              city: faker.address.city(),
              email: faker.internet.email(),
              firstname: faker.name.firstName(),
              street: faker.address.streetAddress(),
              zip: faker.address.zipCode(),
              country: faker.address.country()
            },
            items: [
              {
                jfsku: 'VZ9N01SJN9E',
                outboundItemId: '222495',
                name: 'Zeppelin Box - April 2023',
                merchantSku: '1552',
                quantity: 1,
                itemType: 'BillOfMaterials',
                quantityOpen: 1,
                externalNumber: '',
                price: 0,
                vat: 19
              }
            ],
            senderAddress: {
              company: faker.company.name(),
              city: faker.address.city(),
              email: faker.internet.email(),
              street: faker.address.streetAddress(),
              zip: faker.address.zipCode(),
              country: faker.address.country(),
              phone: faker.phone.number()
            },
            attributes: [],
            priority: 0,
            currency: 'EUR',
            externalNote: 'Mit DHL versenden. Versanddatum: 20.04.2023',
            salesChannel: 'XML-Import',
            desiredDeliveryDate: '2024-04-19T22:00:00.000+00:00',
            shippingMethodId: 'NDZ20AAFC64A2SER',
            shippingType: 'Standard',
            shippingFee: 0,
            orderValue: 0,
            attachments: []
          }
        })
      const order = resOrder.body.order
      const res = await chai
        .request(app)
        .put(`/api/orders/${String(order.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          order: {
            isVisible: false
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'order')
      expect(res.body.order).to.be.an('object')
      expect(res.body.order).to.include.keys('id', 'isVisible')
      expect(res.body.order.isVisible).to.equal(false)
    })
  })

  describe('Get order by posted order id', () => {
    it('Should return 200 OK when a company admin gets an order by posted order id.', async () => {
      const res = await chai
        .request(app)
        .get('/api/orders/1234567890/attributes')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'order')
      expect(res.body.order).to.equal(null)
    })

    it('Should return 200 OK when a company admin gets an order by posted order id.', async () => {
      const postedOrderId = '30669643093901312'
      await chai
        .request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          order: {
            outboundId: 'VZ9N11ZZY4',
            fulfillerId: 'NDZ2',
            merchantOutboundNumber: 'AU-2025-21635-001',
            warehouseId: 'NDZ204DE-12589-0002',
            status: 'Acknowledged',
            shippingAddress: {
              lastname: faker.name.lastName(),
              city: faker.address.city(),
              email: faker.internet.email(),
              firstname: faker.name.firstName(),
              street: faker.address.streetAddress(),
              zip: faker.address.zipCode(),
              country: faker.address.country()
            },
            items: [
              {
                jfsku: 'VZ9N01SJN9E',
                outboundItemId: '222495',
                name: 'Zeppelin Box - April 2023',
                merchantSku: '1552',
                quantity: 1,
                itemType: 'BillOfMaterials',
                quantityOpen: 1,
                externalNumber: '',
                price: 0,
                vat: 19
              }
            ],
            senderAddress: {
              company: faker.company.name(),
              city: faker.address.city(),
              email: faker.internet.email(),
              street: faker.address.streetAddress(),
              zip: faker.address.zipCode(),
              country: faker.address.country(),
              phone: faker.phone.number()
            },
            attributes: [
              {
                key: 'order_id',
                value: postedOrderId,
                attributeType: 'String'
              },
              {
                key: 'FFN-Externe-Nummer',
                value: postedOrderId,
                attributeType: 'String'
              }
            ],
            priority: 0,
            currency: 'EUR',
            externalNote: 'Mit DHL versenden. Versanddatum: 20.04.2023',
            salesChannel: 'XML-Import',
            desiredDeliveryDate: '2024-04-19T22:00:00.000+00:00',
            shippingMethodId: 'NDZ20AAFC64A2SER',
            shippingType: 'Standard',
            shippingFee: 0,
            orderValue: 0,
            attachments: []
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/orders/${postedOrderId}/attributes`)
        .set('Authorization', `Bearer ${tokenCompanyAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'order')
      expect(res.body.order).to.be.an('object')
    })
  })
})
