import chai from 'chai'
import chaiHttp from 'chai-http'
import { faker } from '@faker-js/faker'
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

describe('Title actions', () => {
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

  describe('Get all titles', () => {
    it('Should return 200 Success when an admin successfully retrieves all titles.', async () => {
      const res = await chai
        .request(app)
        .get('/api/titles')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'titles')
      expect(res.body.titles).to.be.an('array')
    })

    it('Should return 200 when a non-admin retrieves all titles.', async () => {
      const res = await chai
        .request(app)
        .get('/api/titles')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'titles')
      expect(res.body.titles).to.be.an('array')
    })
  })

  describe('Create a title', () => {
    it('Should return 201 Created when an admin creates a title.', async () => {
      const res = await chai
        .request(app)
        .post('/api/titles')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          title: {
            name: faker.name.prefix()
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'title')
      expect(res.body.title).to.be.an('object')
      expect(res.body.title).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a user creates the same title.', async () => {
      const titleName = faker.name.prefix()
      await chai
        .request(app)
        .post('/api/titles')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          title: {
            name: titleName
          }
        })
      const res = await chai
        .request(app)
        .post('/api/titles')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          title: {
            name: titleName
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'title')
      expect(res.body.title).to.be.an('object')
      expect(res.body.title).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 204 when a admin deletes a title.', async () => {
      const resTitle = await chai
        .request(app)
        .post('/api/titles')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          title: {
            name: faker.name.prefix()
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/titles/${String(resTitle.body.title.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a title that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/titles/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Title not found')
    })
  })

  describe('Get, update and delete a title', () => {
    it('Should return 200 OK when an owner gets a title by id.', async () => {
      const resTitle = await chai
        .request(app)
        .post('/api/titles')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          title: {
            name: faker.name.prefix()
          }
        })

      const titleId = resTitle.body.title.id

      const res = await chai
        .request(app)
        .get(`/api/titles/${String(titleId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'title')
      expect(res.body.title).to.be.an('object')
      expect(res.body.title).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator gets a title by id.', async () => {
      const resTitle = await chai
        .request(app)
        .post('/api/titles')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          title: {
            name: faker.name.prefix()
          }
        })

      const titleId = resTitle.body.title.id

      const res = await chai
        .request(app)
        .get(`/api/titles/${String(titleId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'title')
      expect(res.body.title).to.be.an('object')
      expect(res.body.title).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a title by id.', async () => {
      const resTitle = await chai
        .request(app)
        .post('/api/titles')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          title: {
            name: faker.name.prefix()
          }
        })

      const titleId = resTitle.body.title.id

      const updatedTitle = faker.name.prefix()

      const res = await chai
        .request(app)
        .put(`/api/titles/${String(titleId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          title: {
            name: updatedTitle
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'title')
      expect(res.body.title).to.be.an('object')
      expect(res.body.title).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
      expect(res.body.title.name).to.equal(updatedTitle)
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a title by id.', async () => {
      const resTitle = await chai
        .request(app)
        .post('/api/titles')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          title: {
            name: faker.name.prefix()
          }
        })

      const titleId = resTitle.body.title.id

      const res = await chai
        .request(app)
        .put(`/api/titles/${String(titleId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: {
            name: faker.name.prefix()
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 200 OK when an administrator deletes a title by id.', async () => {
      const resTitle = await chai
        .request(app)
        .post('/api/titles')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          title: {
            name: faker.name.prefix()
          }
        })

      const titleId = resTitle.body.title.id

      const res = await chai
        .request(app)
        .delete(`/api/titles/${String(titleId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when an non-administrator tries to delete a title by id.', async () => {
      const resTitle = await chai
        .request(app)
        .post('/api/titles')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          title: {
            name: faker.name.prefix()
          }
        })

      const titleId = resTitle.body.title.id

      const res = await chai
        .request(app)
        .delete(`/api/titles/${String(titleId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })
})
