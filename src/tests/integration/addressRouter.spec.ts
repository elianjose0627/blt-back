import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import { deleteTestUser, createAdminTestUser, createCompanyAdministrator, createTestUser, createVerifiedCompany, verifyUser } from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let tokenUser: string
let tokenCompanyAdministrator: string
let userIdAdmin: string

describe('Address actions', () => {
  before(async () => {
    await createAdminTestUser()
    await createCompanyAdministrator()
    await createTestUser()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Jeniffer', lastName: 'Walters', email: 'jenwalters@starkindustries.com', phone: '254720123456', password: 'smashagain' } })

    await verifyUser('jenwalters@starkindustries.com')

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: 'thebiggun' } })

    const resTest = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'drstrange@gmail.com', password: 'thesanctum' } })

    const resCompanyAdministrator = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'nickfury@starkindustries.com', password: 'captainmarvel' } })

    tokenAdmin = resAdmin.body.token
    tokenUser = resTest.body.token
    tokenCompanyAdministrator = resCompanyAdministrator.body.token
    userIdAdmin = resAdmin.body.user.id
  })

  after(async () => {
    await deleteTestUser('drstrange@gmail.com')
    await deleteTestUser('nickfury@starkindustries.com')
  })

  describe('Update an address', () => {
    it('Should return 200 Success when a company owner successfully updates an address.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company 2',
            email: 'ivers@kree.kr'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/addresses`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const resUpdate = await chai
        .request(app)
        .put(`/api/addresses/${String(res.body.address.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nakuru',
            street: 'Kanu Street'
          }
        })

      expect(resUpdate).to.have.status(200)
      expect(resUpdate.body).to.include.keys('statusCode', 'success', 'address')
      expect(resUpdate.body.address).to.be.an('object')
      expect(resUpdate.body.address).to.include.keys('id', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })

    it('Should return 200 Success when a company administrator successfully updates an address.', async () => {
      const resCompany = await createVerifiedCompany(userIdAdmin)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'nickfury@starkindustries.com',
            actionType: 'add'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/addresses`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustries.com', password: 'captainmarvel' } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const resUpdate = await chai
        .request(app)
        .put(`/api/addresses/${String(res.body.address.id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nakuru',
            street: 'Kanu Street'
          }
        })

      expect(resUpdate).to.have.status(200)
      expect(resUpdate.body).to.include.keys('statusCode', 'success', 'address')
      expect(resUpdate.body.address).to.be.an('object')
      expect(resUpdate.body.address).to.include.keys('id', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a company administrator who is not an employee tries to update an address.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company 2',
            email: 'ivers@kree.kr'
          }
        })

      const companyId = resCompany.body.company.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'nickfury@starkindustries.com',
            actionType: 'remove'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustries.com', password: 'captainmarvel' } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const resAddress = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/addresses`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .put(`/api/addresses/${String(resAddress.body.address.id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nakuru',
            street: 'Kanu Street'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or company administrator can perform this action')
    })

    it('Should return 403 Forbidden when a user who is a company employee tries to update an address.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company 2',
            email: 'ivers@kree.kr'
          }
        })

      const companyId = resCompany.body.company.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'drstrange@gmail.com',
            actionType: 'add'
          }
        })

      const resTest = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'drstrange@gmail.com', password: 'thesanctum' } })

      tokenUser = resTest.body.token

      const resAddress = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/addresses`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .put(`/api/addresses/${String(resAddress.body.address.id)}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nakuru',
            street: 'Kanu Street'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or company administrator can perform this action')
    })

    it('Should return 403 Forbidden when a user who is neither a company employee nor an owner  tries to update an address.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company 2',
            email: 'ivers@kree.kr'
          }
        })

      const companyId = resCompany.body.company.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'drstrange@gmail.com',
            actionType: 'remove'
          }
        })

      const resTest = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'drstrange@gmail.com', password: 'thesanctum' } })

      tokenUser = resTest.body.token

      const resAddress = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/addresses`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .put(`/api/addresses/${String(resAddress.body.address.id)}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nakuru',
            street: 'Kanu Street'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or company administrator can perform this action')
    })
  })
})
