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
  createInvoice
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

describe('Invoice actions', () => {
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

  describe('Get all invoices', () => {
    it('Should return 200 Success when an admin successfully retrieves all invoices.', async () => {
      await createInvoice(companyId, adminUserId)
      const res = await chai
        .request(app)
        .get('/api/invoices')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'invoices')
      expect(res.body.invoices).to.be.an('array')
    })

    it('Should return 200 Success when an admin successfully retrieves all invoices with search params.', async () => {
      await createInvoice(companyId, adminUserId)
      const res = await chai
        .request(app)
        .get('/api/invoices')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .query({ search: '1' })
      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'invoices')
      expect(res.body.invoices).to.be.an('array')
    })

    it('Should return 200 Success when a company admin successfully retrieves all invoices.', async () => {
      await createInvoice(companyId, companyAdminUserId)
      const res = await chai
        .request(app)
        .get('/api/invoices')
        .set('Authorization', `Bearer ${tokenCompanyAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'invoices')
      expect(res.body.invoices).to.be.an('array')
    })

    it('Should return 200 Success when a user successfully retrieves all invoices.', async () => {
      await createInvoice(companyId, userId)
      const res = await chai
        .request(app)
        .get('/api/invoices')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'invoices')
      expect(res.body.invoices).to.be.an('array')
    })
  })

  describe('Get invoice by id', () => {
    let adminInvoiceId: string
    let companyAdminInvoiceId: string
    let userIdInvoiceId: string

    beforeEach(async () => {
      const adminInvoice = await createInvoice(companyId, adminUserId)
      adminInvoiceId = adminInvoice.id

      const companyAdminInvoice = await createInvoice(companyId, companyAdminUserId)
      companyAdminInvoiceId = companyAdminInvoice.id

      const userIdInvoice = await createInvoice(companyId, userId)
      userIdInvoiceId = userIdInvoice.id
    })

    it('Should return 200 Success when an admin successfully retrieves an invoice by ID', async () => {
      const res = await chai
        .request(app)
        .get(`/api/invoices/${adminInvoiceId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'invoice')
      expect(res.body.invoice).to.be.an('object')
      expect(res.body.invoice.id).to.equal(adminInvoiceId)
    })

    it('Should return 200 Success when a company admin successfully retrieves an invoice by id for their company', async () => {
      const res = await chai
        .request(app)
        .get(`/api/invoices/${companyAdminInvoiceId}`)
        .set('Authorization', `Bearer ${tokenCompanyAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'invoice')
      expect(res.body.invoice).to.be.an('object')
      expect(res.body.invoice.id).to.equal(companyAdminInvoiceId)
    })

    it('Should return 200 Success when a user successfully retrieves their own invoice by id', async () => {
      const res = await chai
        .request(app)
        .get(`/api/invoices/${userIdInvoiceId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'invoice')
      expect(res.body.invoice).to.be.an('object')
      expect(res.body.invoice.id).to.equal(userIdInvoiceId)
    })

    it('Should return 403 Forbidden when a user tries to access an invoice that does not belong to them', async () => {
      const otherInvoice = await createInvoice(companyId, adminUserId)
      const res = await chai
        .request(app)
        .get(`/api/invoices/${String(otherInvoice.id)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You are not authorized to access this invoice')
    })
  })
})
