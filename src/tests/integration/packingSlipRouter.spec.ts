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
  createPackingSlip
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

describe('Packing Slip actions', () => {
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

  describe('Get all packing slips', () => {
    it('Should return 200 Success when an admin successfully retrieves all packing slips.', async () => {
      await createPackingSlip(companyId, adminUserId)
      const res = await chai
        .request(app)
        .get('/api/packing-slip')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'packingSlips')
      expect(res.body.packingSlips).to.be.an('array')
    })

    it('Should return 200 Success when an admin successfully retrieves all packingSlips with search params.', async () => {
      await createPackingSlip(companyId, adminUserId)
      const res = await chai
        .request(app)
        .get('/api/packing-slips')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .query({ search: '1' })
      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'packingSlips')
      expect(res.body.packingSlips).to.be.an('array')
    })

    it('Should return 200 Success when a company admin successfully retrieves all pacingSlips.', async () => {
      await createPackingSlip(companyId, companyAdminUserId)
      const res = await chai
        .request(app)
        .get('/api/packing-slips')
        .set('Authorization', `Bearer ${tokenCompanyAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'packingSlips')
      expect(res.body.packingSlips).to.be.an('array')
    })

    it('Should return 200 Success when a user successfully retrieves all packingSlips.', async () => {
      await createPackingSlip(companyId, userId)
      const res = await chai
        .request(app)
        .get('/api/packing-slips')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'packingSlips')
      expect(res.body.packingSlips).to.be.an('array')
    })
  })

  describe('Get packingSlip by id', () => {
    let adminPackingSlipId: string
    let companyAdminPackingSlipId: string
    let userIdPackingSlipId: string

    beforeEach(async () => {
      const adminPackingSlip = await createPackingSlip(companyId, adminUserId)
      adminPackingSlipId = adminPackingSlip.id

      const companyAdminPackingSlip = await createPackingSlip(companyId, companyAdminUserId)
      companyAdminPackingSlipId = companyAdminPackingSlip.id

      const userIdPackingSlip = await createPackingSlip(companyId, userId)
      userIdPackingSlipId = userIdPackingSlip.id
    })

    it('Should return 200 Success when an admin successfully retrieves an packingSlip by ID', async () => {
      const res = await chai
        .request(app)
        .get(`/api/packing-slips/${adminPackingSlipId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'packingSlip')
      expect(res.body.packingSlip).to.be.an('object')
      expect(res.body.packingSlip.id).to.equal(adminPackingSlipId)
    })

    it('Should return 200 Success when a company admin successfully retrieves an pacingSlip by id for their company', async () => {
      const res = await chai
        .request(app)
        .get(`/api/packing-slips/${companyAdminPackingSlipId}`)
        .set('Authorization', `Bearer ${tokenCompanyAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'packingSlip')
      expect(res.body.packingSlip).to.be.an('object')
      expect(res.body.packingSlip.id).to.equal(companyAdminPackingSlipId)
    })

    it('Should return 200 Success when a user successfully retrieves their own packingSlip by id', async () => {
      const res = await chai
        .request(app)
        .get(`/api/packing-slips/${userIdPackingSlipId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'packingSlip')
      expect(res.body.packingSlip).to.be.an('object')
      expect(res.body.packingSlip.id).to.equal(userIdPackingSlipId)
    })

    it('Should return 403 Forbidden when a user tries to access an packingSlip that does not belong to them', async () => {
      const otherPackingSlip = await createPackingSlip(companyId, adminUserId)
      const res = await chai
        .request(app)
        .get(`/api/packing-slips/${String(otherPackingSlip.id)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You are not authorized to access this packingSlip')
    })
  })
})
