import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  iversAtKreeDotKrPassword,
  sheHulkAtStarkIndustriesPassword
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string

describe('Salutation actions', () => {
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

  describe('Get all salutations', () => {
    it('Should return 200 Success when an admin successfully retrieves all salutations.', async () => {
      const res = await chai
        .request(app)
        .get('/api/salutations')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'salutations')
      expect(res.body.salutations).to.be.an('array')
    })

    it('Should return 200 when a non-admin retrieves all salutations.', async () => {
      const res = await chai
        .request(app)
        .get('/api/salutations')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'salutations')
      expect(res.body.salutations).to.be.an('array')
    })
  })

  describe('Create a salutation', () => {
    it('Should return 201 Created when an admin creates a salutation.', async () => {
      const res = await chai
        .request(app)
        .post('/api/salutations')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salutation: {
            name: 'Dear'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'salutation')
      expect(res.body.salutation).to.be.an('object')
      expect(res.body.salutation).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a user creates the same salutation.', async () => {
      const res = await chai
        .request(app)
        .post('/api/salutations')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salutation: {
            name: 'Dear'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'salutation')
      expect(res.body.salutation).to.be.an('object')
      expect(res.body.salutation).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 204 when a admin deletes a salutation.', async () => {
      const resSalutation = await chai
        .request(app)
        .post('/api/salutations')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salutation: {
            name: 'Hey'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/salutations/${String(resSalutation.body.salutation.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a salutation that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/salutations/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Salutation not found')
    })
  })

  describe('Get, update and delete a salutation', () => {
    it('Should return 200 OK when an owner gets a salutation by id.', async () => {
      const resSalutation = await chai
        .request(app)
        .post('/api/salutations')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salutation: {
            name: 'Hello'
          }
        })

      const salutationId = resSalutation.body.salutation.id

      const res = await chai
        .request(app)
        .get(`/api/salutations/${String(salutationId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'salutation')
      expect(res.body.salutation).to.be.an('object')
      expect(res.body.salutation).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator gets a salutation by id.', async () => {
      const resSalutation = await chai
        .request(app)
        .post('/api/salutations')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salutation: {
            name: 'Greetings'
          }
        })

      const salutationId = resSalutation.body.salutation.id

      const res = await chai
        .request(app)
        .get(`/api/salutations/${String(salutationId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'salutation')
      expect(res.body.salutation).to.be.an('object')
      expect(res.body.salutation).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a salutation by id.', async () => {
      const resSalutation = await chai
        .request(app)
        .post('/api/salutations')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salutation: {
            name: 'Greetings'
          }
        })

      const salutationId = resSalutation.body.salutation.id

      const res = await chai
        .request(app)
        .put(`/api/salutations/${String(salutationId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salutation: {
            name: 'Greetings.'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'salutation')
      expect(res.body.salutation).to.be.an('object')
      expect(res.body.salutation).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
      expect(res.body.salutation.name).to.equal('Greetings.')
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a salutation by id.', async () => {
      const resSalutation = await chai
        .request(app)
        .post('/api/salutations')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salutation: {
            name: 'Greetings'
          }
        })

      const salutationId = resSalutation.body.salutation.id

      const res = await chai
        .request(app)
        .put(`/api/salutations/${String(salutationId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          salutation: {
            name: 'Greetings.'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 200 OK when an administrator deletes a salutation by id.', async () => {
      const resSalutation = await chai
        .request(app)
        .post('/api/salutations')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salutation: {
            name: 'Good Morning'
          }
        })

      const salutationId = resSalutation.body.salutation.id

      const res = await chai
        .request(app)
        .delete(`/api/salutations/${String(salutationId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when an non-administrator tries to delete a salutation by id.', async () => {
      const resSalutation = await chai
        .request(app)
        .post('/api/salutations')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salutation: {
            name: 'Good Morning'
          }
        })

      const salutationId = resSalutation.body.salutation.id

      const res = await chai
        .request(app)
        .delete(`/api/salutations/${String(salutationId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })
})
