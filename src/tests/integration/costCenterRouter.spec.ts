import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  verifyCompanyDomain
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string

describe('Cost Centers actions', () => {
  before(async () => {
    await createAdminTestUser()

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

    tokenAdmin = resAdmin.body.token
    token = resUser.body.token
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
            center: 10
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
            center: 10
          }
        })

      const costCenterId = resCostCenter.body.costCenter.id

      const res = await chai
        .request(app)
        .put(`/api/cost-centers/${String(costCenterId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          costCenter: {
            center: 11
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'costCenter')
      expect(res.body.costCenter).to.be.an('object')
      expect(res.body.costCenter).to.include.keys('id', 'center', 'createdAt', 'updatedAt')
      expect(res.body.costCenter.center).to.equal(11)
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
            center: 10
          }
        })
      const costCenterId = resCostCenter.body.costCenter.id

      const res = await chai
        .request(app)
        .delete(`/api/cost-centers/${String(costCenterId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when an user deletes a cost center by id.', async () => {
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
            center: 10
          }
        })
      const costCenterId = resCostCenter.body.costCenter.id

      const res = await chai
        .request(app)
        .delete(`/api/cost-centers/${String(costCenterId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
    })
  })
})
