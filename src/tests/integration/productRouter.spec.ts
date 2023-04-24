import chai from 'chai'
import chaiHttp from 'chai-http'
import { v1 as uuidv1 } from 'uuid'
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

describe('Product actions', () => {
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

  describe('Get all products', () => {
    it('Should return 200 Success when an admin successfully retrieves all products.', async () => {
      const res = await chai
        .request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array')
    })

    it('Should return 200 Success when an admin successfully retrieves all products with params.', async () => {
      const res = await chai
        .request(app)
        .get('/api/products')
        .query({
          limit: 10,
          page: 1,
          search: '123'
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array')
    })

    it('Should return 403 when a non-admin retrieves all products.', async () => {
      const res = await chai
        .request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })

  describe('Create a product', () => {
    it('Should return 201 Created when an admin creates a product.', async () => {
      const res = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '1237',
            merchantSku: '1237',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an admin user creates the same product.', async () => {
      const res = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '1237',
            merchantSku: '1237',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
    })

    it('Should return 404 Not Found when an admin user tries to create a product on behalf of a company that does not exist.', async () => {
      const res = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            companyId: uuidv1(),
            name: 'Soda Water',
            jfsku: '12371',
            merchantSku: '12371',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Company not found')
    })

    it('Should return 201 Created when an admin user creates a product on behalf of a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company12379products.com'
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(companyId)
      const res = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            companyId,
            name: 'Soda Water',
            jfsku: '12379',
            merchantSku: '12379',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
    })

    it('Should return 204 when a admin deletes a product.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '123123',
            merchantSku: '123123',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/products/${String(resProduct.body.product.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a product that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/products/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Product not found')
    })
  })

  describe('Get, update and delete a product', () => {
    it('Should return 200 OK when an owner gets a product by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const res = await chai
        .request(app)
        .get(`/api/products/${String(productId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator gets a product by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const res = await chai
        .request(app)
        .get(`/api/products/${String(productId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
    })

    it('Should return 422 Unprocessable entity when an administrator gets a product using an invalid id.', async () => {
      const res = await chai
        .request(app)
        .get('/api/products/123')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('A validation error has occured')
    })

    it('Should return 200 OK when an administrator updates a product by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const res = await chai
        .request(app)
        .put(`/api/products/${String(productId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water Fresh',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
      expect(res.body.product.name).to.equal('Soda Water Fresh')
    })

    it('Should return 403 Forbidden when an non-employee, non-admin, non-owner tries to update a product by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water Fresh',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const res = await chai
        .request(app)
        .put(`/api/products/${String(productId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          product: {
            name: 'Soda Water Fresh Mix',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, admin, company administrator or campaign manager can perform this action')
    })

    it('Should return 200 OK when an administrator deletes a product by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water Fresh',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const res = await chai
        .request(app)
        .delete(`/api/products/${String(productId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when an non-employee, non-admin, non-owner tries to delete a product by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water Fresh',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const res = await chai
        .request(app)
        .delete(`/api/products/${String(productId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, admin, company administrator or campaign manager can perform this action')
    })
  })
})
