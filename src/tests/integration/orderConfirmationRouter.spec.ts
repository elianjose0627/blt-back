import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  createCompanyAdministratorWithCompany,
  iversAtKreeDotKrPassword,
  sheHulkAtStarkIndustriesPassword,
  sharonCarterPassword,
  createOrderConfirmation
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string
let tokenCompanyAdmin: string
let companyId: string
let userId: string
let adminUserId: string
let companyAdminUserId: string

describe('Order Confirmation actions', () => {
  before(async () => {
    await createAdminTestUser()
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

    const resCompanyAdminTwo = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'sharoncarter@starkindustriesmarvel.com', password: sharonCarterPassword } })

    tokenAdmin = resAdmin.body.token
    adminUserId = resAdmin.body.user.id
    token = resUser.body.token
    userId = resUser.body.user.id
    tokenCompanyAdmin = resCompanyAdminTwo.body.token
    companyAdminUserId = resCompanyAdminTwo.body.user.id
    companyId = resCompanyAdminTwo.body.user.company.id
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Get all order confirmations', () => {
    it('Should return 200 Success when an admin successfully retrieves all order confirmations.', async () => {
      await createOrderConfirmation(companyId, adminUserId)
      const res = await chai
        .request(app)
        .get('/api/order-confirmations')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orderConfirmations')
      expect(res.body.orderConfirmations).to.be.an('array')
    })

    it('Should return 200 Success when an admin successfully retrieves all order confirmations with search params.', async () => {
      await createOrderConfirmation(companyId, adminUserId)
      const res = await chai
        .request(app)
        .get('/api/order-confirmations')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .query({ search: '1' })
      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orderConfirmations')
      expect(res.body.orderConfirmations).to.be.an('array')
    })

    it('Should return 200 Success when a company admin tries to retrieve all order confirmations.', async () => {
      await createOrderConfirmation(companyId, companyAdminUserId)
      const res = await chai
        .request(app)
        .get('/api/order-confirmations')
        .set('Authorization', `Bearer ${tokenCompanyAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orderConfirmations')
      expect(res.body.orderConfirmations).to.be.an('array')
    })

    it('Should return 200 Success when a user tries to retrieve all order confirmations.', async () => {
      await createOrderConfirmation(companyId, userId)
      const res = await chai
        .request(app)
        .get('/api/order-confirmations')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orderConfirmations')
      expect(res.body.orderConfirmations).to.be.an('array')
    })
  })

  describe('Get oderConfirmation by id', () => {
    let adminOrderConfirmationId: string
    let companyAdminOrderConfirmationId: string
    let userIdOrderConfirmationId: string

    beforeEach(async () => {
      const adminOrderConfirmation = await createOrderConfirmation(companyId, adminUserId)
      adminOrderConfirmationId = adminOrderConfirmation.id

      const companyAdminOrderConfirmation = await createOrderConfirmation(companyId, companyAdminUserId)
      companyAdminOrderConfirmationId = companyAdminOrderConfirmation.id

      const userIdOrderConfirmation = await createOrderConfirmation(companyId, userId)
      userIdOrderConfirmationId = userIdOrderConfirmation.id
    })

    it('Should return 200 Success when an admin successfully retrieves an order confirmation by ID', async () => {
      const res = await chai
        .request(app)
        .get(`/api/order-confirmations/${adminOrderConfirmationId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orderConfirmation')
      expect(res.body.orderConfirmation).to.be.an('object')
      expect(res.body.orderConfirmation.id).to.equal(adminOrderConfirmationId)
    })

    it('Should return 200 Success when a company admin successfully retrieves an order confirmation by id for their company', async () => {
      const res = await chai
        .request(app)
        .get(`/api/order-confirmations/${companyAdminOrderConfirmationId}`)
        .set('Authorization', `Bearer ${tokenCompanyAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orderConfirmation')
      expect(res.body.orderConfirmation).to.be.an('object')
      expect(res.body.orderConfirmation.id).to.equal(companyAdminOrderConfirmationId)
    })

    it('Should return 200 Success when a user successfully retrieves their own order confirmation by id', async () => {
      const res = await chai
        .request(app)
        .get(`/api/order-confirmations/${userIdOrderConfirmationId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orderConfirmation')
      expect(res.body.orderConfirmation).to.be.an('object')
      expect(res.body.orderConfirmation.id).to.equal(userIdOrderConfirmationId)
    })

    it('Should return 403 Forbidden when a user tries to access an order confirmation that does not belong to them', async () => {
      const otherOrderConfirmation = await createOrderConfirmation(companyId, adminUserId)
      const res = await chai
        .request(app)
        .get(`/api/order-confirmations/${String(otherOrderConfirmation.id)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You are not authorized to access this order confirmation')
    })
  })
})
