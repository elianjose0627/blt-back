import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string

describe('Product Color actions', () => {
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

  describe('Get all product colors', () => {
    it('Should return 200 Success when an admin successfully retrieves all product colors.', async () => {
      await chai
        .request(app)
        .post('/api/product-colors')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productColor: {
            name: 'red',
            hexCode: '#ff0000'
          }
        })

      const res = await chai
        .request(app)
        .get('/api/product-colors')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productColors')
      expect(res.body.productColors).to.be.an('array')
    })

    it('Should return 200 when a non-admin retrieves all product colors.', async () => {
      const res = await chai
        .request(app)
        .get('/api/product-colors')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productColors')
      expect(res.body.productColors).to.be.an('array')
    })
  })

  describe('Create a product color', () => {
    it('Should return 201 Created when an admin creates a product color.', async () => {
      const res = await chai
        .request(app)
        .post('/api/product-colors')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productColor: {
            name: 'blue',
            hexCode: '#0000ff'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'productColor')
      expect(res.body.productColor).to.be.an('object')
      expect(res.body.productColor).to.include.keys('id', 'name', 'hexCode', 'rgb', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a admin creates the same product color.', async () => {
      await chai
        .request(app)
        .post('/api/product-colors')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productColor: {
            name: 'green',
            hexCode: '#00ff00'
          }
        })

      const res = await chai
        .request(app)
        .post('/api/product-colors')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productColor: {
            name: 'green',
            hexCode: '#00ff00'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productColor')
      expect(res.body.productColor).to.be.an('object')
      expect(res.body.productColor).to.include.keys('id', 'name', 'hexCode', 'rgb', 'createdAt', 'updatedAt')
    })

    it('Should return 204 when a admin deletes a product color.', async () => {
      const resProductColor = await chai
        .request(app)
        .post('/api/product-colors')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productColor: {
            name: 'yellow',
            hexCode: '#ffff00'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/product-colors/${String(resProductColor.body.productColor.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a product color that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/product-colors/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Product Color not found')
    })
  })

  describe('Get, update and delete a product color', () => {
    it('Should return 200 OK when an owner gets a product color by id.', async () => {
      const resProductColor = await chai
        .request(app)
        .post('/api/product-colors')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productColor: {
            name: 'white',
            hexCode: '#ffffff'
          }
        })

      const productColorId = resProductColor.body.productColor.id

      const res = await chai
        .request(app)
        .get(`/api/product-colors/${String(productColorId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productColor')
      expect(res.body.productColor).to.be.an('object')
      expect(res.body.productColor).to.include.keys('id', 'name', 'hexCode', 'rgb', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator gets a product color by id.', async () => {
      const resProductColor = await chai
        .request(app)
        .post('/api/product-colors')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productColor: {
            name: 'cyan',
            hexCode: '#00ffff'
          }
        })

      const productColorId = resProductColor.body.productColor.id

      const res = await chai
        .request(app)
        .get(`/api/product-colors/${String(productColorId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productColor')
      expect(res.body.productColor).to.be.an('object')
      expect(res.body.productColor).to.include.keys('id', 'name', 'hexCode', 'rgb', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a product color by id.', async () => {
      const resProductColor = await chai
        .request(app)
        .post('/api/product-colors')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productColor: {
            name: 'balck',
            hexCode: '#000000'
          }
        })

      const productColorId = resProductColor.body.productColor.id

      const res = await chai
        .request(app)
        .put(`/api/product-colors/${String(productColorId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productColor: {
            name: 'black',
            hexCode: '#000000'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productColor')
      expect(res.body.productColor).to.be.an('object')
      expect(res.body.productColor).to.include.keys('id', 'name', 'hexCode', 'rgb', 'createdAt', 'updatedAt')
      expect(res.body.productColor.name).to.equal('black')
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a product color by id.', async () => {
      const resProductColor = await chai
        .request(app)
        .post('/api/product-colors')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productColor: {
            name: 'yellow',
            hexCode: '#ffff00'
          }
        })

      const productColorId = resProductColor.body.productColor.id

      const res = await chai
        .request(app)
        .put(`/api/product-colors/${String(productColorId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          productColor: {
            name: 'yellow',
            hexCode: '#ffff00'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 200 OK when an administrator deletes a product color by id.', async () => {
      const resProductColor = await chai
        .request(app)
        .post('/api/product-colors')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productColor: {
            name: 'yellow',
            hexCode: '#ffff00'
          }
        })

      const productColorId = resProductColor.body.productColor.id

      const res = await chai
        .request(app)
        .delete(`/api/product-colors/${String(productColorId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when an non-administrator tries to delete a product color by id.', async () => {
      const resProductColor = await chai
        .request(app)
        .post('/api/product-colors')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productColor: {
            name: 'yellow',
            hexCode: '#ffff00'
          }
        })

      const productColorId = resProductColor.body.productColor.id

      const res = await chai
        .request(app)
        .delete(`/api/product-colors/${String(productColorId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })
})
