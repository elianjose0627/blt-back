import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  verifyCompanyDomain,
  iversAtKreeDotKrPassword,
  sheHulkAtStarkIndustriesPassword
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string

describe('Secondary Domain actions', () => {
  before(async () => {
    await createAdminTestUser()

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

    tokenAdmin = resAdmin.body.token
    token = resUser.body.token
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Get, update and delete a secondary domain', () => {
    it('Should return 200 OK when an owner gets a secondary domain by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel secondary Domain Company',
            email: 'ivers@kreesecondarydomain.ke'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resSecondaryDomain = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/secondary-domains`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          secondaryDomain: {
            name: 'kreesecondarydomain.ke'
          }
        })

      const secondaryDomainId = resSecondaryDomain.body.secondaryDomain.id

      const res = await chai
        .request(app)
        .get(`/api/secondary-domains/${String(secondaryDomainId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'secondaryDomain')
      expect(res.body.secondaryDomain).to.be.an('object')
      expect(res.body.secondaryDomain).to.include.keys('id', 'name', 'isVerified', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a secondary domain by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Secondary Domain Company 1',
            email: 'ivers@kreesecondarydomain1.ke'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resSecondaryDomain = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/secondary-domains`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          secondaryDomain: {
            name: 'kreesecondarydomain1.ke'
          }
        })

      const secondaryDomainId = resSecondaryDomain.body.secondaryDomain.id

      const res = await chai
        .request(app)
        .put(`/api/secondary-domains/${String(secondaryDomainId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          secondaryDomain: {
            name: 'kreesecondarydomain1.com'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'secondaryDomain')
      expect(res.body.secondaryDomain).to.be.an('object')
      expect(res.body.secondaryDomain).to.include.keys('id', 'name', 'isVerified', 'createdAt', 'updatedAt')
      expect(res.body.secondaryDomain.name).to.equal('kreesecondarydomain1.com')
    })

    it('Should return 200 OK when an administrator deletes a secondary domain by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Secondary Domain Company 2',
            email: 'ivers@kreesecondarydomain2.ke'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resSecondaryDomain = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/secondary-domains`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          secondaryDomain: {
            name: 'kreesecondarydomain2.ke'
          }
        })
      const secondaryDomainId = resSecondaryDomain.body.secondaryDomain.id

      const res = await chai
        .request(app)
        .delete(`/api/secondary-domains/${String(secondaryDomainId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when an user deletes a secondary domain by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Secondary Domain Company 3',
            email: 'ivers@kreesecondarydomain3.ke'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resSecondaryDomain = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/secondary-domains`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          secondaryDomain: {
            name: 'kreesecondarydomain3.ke'
          }
        })
      const secondaryDomainId = resSecondaryDomain.body.secondaryDomain.id

      const res = await chai
        .request(app)
        .delete(`/api/secondary-domains/${String(secondaryDomainId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
    })
  })
})
