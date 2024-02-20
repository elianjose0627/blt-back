import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  verifyCompanyDomain,
  createCompanyAdministratorWithCompany,
  createCampaignManager
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string
let tokenCompanyAdminTwo: string
let tokenCampaignManager: string

describe('Cost Centers actions', () => {
  before(async () => {
    await createAdminTestUser()
    await createCompanyAdministratorWithCompany('minerva@kreecostcenter1.kr', 'thedoctor')
    await createCampaignManager('ronan@kree.kr', 'theaccuser')

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
      .send({ user: { email: 'minerva@kreecostcenter1.kr', password: 'thedoctor' } })

    const resCampaignManager = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ronan@kree.kr', password: 'theaccuser' } })

    tokenAdmin = resAdmin.body.token
    token = resUser.body.token
    tokenCompanyAdminTwo = resCompanyAdminTwo.body.token
    tokenCampaignManager = resCampaignManager.body.token
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Get, update and delete a cost center', () => {
    it('Should return 200 OK when an owner gets a cost center by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Cost Center Company',
            email: 'ivers@kreecostcenter.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resCostCenter = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/cost-centers`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          costCenter: {
            center: '10'
          }
        })

      const costCenterId = resCostCenter.body.costCenter.id

      const res = await chai
        .request(app)
        .get(`/api/cost-centers/${String(costCenterId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'costCenter')
      expect(res.body.costCenter).to.be.an('object')
      expect(res.body.costCenter).to.include.keys('id', 'center', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a cost center by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Cost Center Company 1',
            email: 'ivers@kreecostcenter1.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resCostCenter = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/cost-centers`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          costCenter: {
            center: '10'
          }
        })

      const costCenterId = resCostCenter.body.costCenter.id

      const res = await chai
        .request(app)
        .put(`/api/cost-centers/${String(costCenterId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          costCenter: {
            center: '11'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'costCenter')
      expect(res.body.costCenter).to.be.an('object')
      expect(res.body.costCenter).to.include.keys('id', 'center', 'createdAt', 'updatedAt')
      expect(res.body.costCenter.center).to.equal('11')
    })

    it('Should return 200 OK when a company admin updates a cost center by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Cost Center Company 1',
            email: 'ivers2@kreecostcenter1.kr',
            domain: 'kreecostcenter1.kr'
          }
        })

      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(companyId)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'minerva@kreecostcenter1.kr',
            actionType: 'add'
          }
        })

      const resCompanyAdmin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'minerva@kreecostcenter1.kr', password: 'thedoctor' } })

      tokenCompanyAdminTwo = resCompanyAdmin.body.token

      const resCostCenter = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/cost-centers`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          costCenter: {
            center: '10'
          }
        })

      const costCenterId = resCostCenter.body.costCenter.id

      const res = await chai
        .request(app)
        .put(`/api/cost-centers/${String(costCenterId)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)
        .send({
          costCenter: {
            center: '11'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'costCenter')
      expect(res.body.costCenter).to.be.an('object')
      expect(res.body.costCenter).to.include.keys('id', 'center', 'createdAt', 'updatedAt')
      expect(res.body.costCenter.center).to.equal('11')
    })

    it('Should return 403 Forbidden when a campaign manager without access permissions tries to update a cost center by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Cost Center Company 1',
            email: 'ivers2@kree.kr',
            domain: 'kree.kr'
          }
        })

      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(companyId)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'ronan@kree.kr',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ronan@kree.kr', password: 'theaccuser' } })

      tokenCampaignManager = resCampaignManager.body.token

      const resCostCenter = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/cost-centers`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          costCenter: {
            center: '10'
          }
        })

      const costCenterId = resCostCenter.body.costCenter.id

      const res = await chai
        .request(app)
        .put(`/api/cost-centers/${String(costCenterId)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          costCenter: {
            center: '11'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })

    it('Should return 200 OK when an administrator deletes a cost center by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Cost Center Company 2',
            email: 'ivers@kreecostcenter2.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resCostCenter = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/cost-centers`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          costCenter: {
            center: '10'
          }
        })
      const costCenterId = resCostCenter.body.costCenter.id

      const res = await chai
        .request(app)
        .delete(`/api/cost-centers/${String(costCenterId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when a user deletes a cost center by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Cost Center Company 3',
            email: 'ivers@kreecostcenter3.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resCostCenter = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/cost-centers`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          costCenter: {
            center: '10'
          }
        })
      const costCenterId = resCostCenter.body.costCenter.id

      const res = await chai
        .request(app)
        .delete(`/api/cost-centers/${String(costCenterId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('Only the owner or admin can perform this action')
    })
  })
})
