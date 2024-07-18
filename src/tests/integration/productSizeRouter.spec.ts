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

describe('Product Size actions', () => {
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

  describe('Get all product sizes', () => {
    it('Should return 200 Success when an admin successfully retrieves all product sizes.', async () => {
      await chai
        .request(app)
        .post('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productSize: {
            name: 'xxxl'
          }
        })

      const res = await chai
        .request(app)
        .get('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productSizes')
      expect(res.body.productSizes).to.be.an('array')
    })

    it('Should return 200 Success when an admin successfully retrieves all product sizes with a filter.', async () => {
      await chai
        .request(app)
        .post('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productSize: {
            name: '4xl',
            type: 'fabric'
          }
        })

      const res = await chai
        .request(app)
        .get('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .query({
          search: 'fabric'
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productSizes')
      expect(res.body.productSizes).to.be.an('array').lengthOf(1)
    })

    it('Should return 200 when a non-admin retrieves all product sizes.', async () => {
      const res = await chai
        .request(app)
        .get('/api/product-sizes')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productSizes')
      expect(res.body.productSizes).to.be.an('array')
    })
  })

  describe('Create a product size', () => {
    it('Should return 201 Created when an admin creates a product size.', async () => {
      const res = await chai
        .request(app)
        .post('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productSize: {
            name: 'xs'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'productSize')
      expect(res.body.productSize).to.be.an('object')
      expect(res.body.productSize).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a admin creates the same product size.', async () => {
      await chai
        .request(app)
        .post('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productSize: {
            name: 'xxl'
          }
        })

      const res = await chai
        .request(app)
        .post('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productSize: {
            name: 'xxl'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productSize')
      expect(res.body.productSize).to.be.an('object')
      expect(res.body.productSize).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 204 when a admin deletes a product size.', async () => {
      const resProductSize = await chai
        .request(app)
        .post('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productSize: {
            name: 'l'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/product-sizes/${String(resProductSize.body.productSize.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a product size that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/product-sizes/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Product Size not found')
    })
  })

  describe('Get, update and delete a product size', () => {
    it('Should return 200 OK when an owner gets a product size by id.', async () => {
      const resProductSize = await chai
        .request(app)
        .post('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productSize: {
            name: 'm'
          }
        })

      const productSizeId = resProductSize.body.productSize.id

      const res = await chai
        .request(app)
        .get(`/api/product-sizes/${String(productSizeId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productSize')
      expect(res.body.productSize).to.be.an('object')
      expect(res.body.productSize).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator gets a product size by id.', async () => {
      const resProductSize = await chai
        .request(app)
        .post('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productSize: {
            name: 's'
          }
        })

      const productSizeId = resProductSize.body.productSize.id

      const res = await chai
        .request(app)
        .get(`/api/product-sizes/${String(productSizeId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productSize')
      expect(res.body.productSize).to.be.an('object')
      expect(res.body.productSize).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a product size by id.', async () => {
      const resProductSize = await chai
        .request(app)
        .post('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productSize: {
            name: 'x'
          }
        })

      const productSizeId = resProductSize.body.productSize.id

      const res = await chai
        .request(app)
        .put(`/api/product-sizes/${String(productSizeId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productSize: {
            name: 'xl'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productSize')
      expect(res.body.productSize).to.be.an('object')
      expect(res.body.productSize).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
      expect(res.body.productSize.name).to.equal('xl')
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a product size by id.', async () => {
      const resProductSize = await chai
        .request(app)
        .post('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productSize: {
            name: 'l'
          }
        })

      const productSizeId = resProductSize.body.productSize.id

      const res = await chai
        .request(app)
        .put(`/api/product-sizes/${String(productSizeId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          productSize: {
            name: 'l'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 200 OK when an administrator deletes a product size by id.', async () => {
      const resProductSize = await chai
        .request(app)
        .post('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productSize: {
            name: 'l'
          }
        })

      const productSizeId = resProductSize.body.productSize.id

      const res = await chai
        .request(app)
        .delete(`/api/product-sizes/${String(productSizeId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when an non-administrator tries to delete a product size by id.', async () => {
      const resProductSize = await chai
        .request(app)
        .post('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productSize: {
            name: 'l'
          }
        })

      const productSizeId = resProductSize.body.productSize.id

      const res = await chai
        .request(app)
        .delete(`/api/product-sizes/${String(productSizeId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })
})
