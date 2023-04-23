import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  createCompanyAdministrator,
  order
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let tokenCompanyAdmin: string
let token: string

describe('Order actions', () => {
  before(async () => {
    await createAdminTestUser()
    await createCompanyAdministrator()

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

    const resCompanyAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

    tokenAdmin = resAdmin.body.token
    token = resUser.body.token
    tokenCompanyAdmin = resCompanyAdmin.body.token
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
      expect(res.body).to.include.keys('statusCode', 'success', 'orders')
      expect(res.body.orders).to.be.an('array')
    })

    it('Should return 200 OK when an admin gets all orders.', async () => {
      const res = await chai
        .request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orders')
      expect(res.body.orders).to.be.an('array')
    })

    it('Should return 200 OK when a company admin gets all orders.', async () => {
      const res = await chai
        .request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${tokenCompanyAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orders')
      expect(res.body.orders).to.be.an('array')
    })
  })
})
