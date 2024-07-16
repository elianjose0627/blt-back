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

describe('Product Graduated Price actions', () => {
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

  describe('Create and delete a product graduation price', () => {
    it('Should return 204 when a admin deletes a graduated price.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Macbook Pro M1',
            jfsku: 'J34971M1',
            merchantSku: '42721M1',
            type: 'generic',
            productGroup: 'laptop'
          }
        })

      const productId = resProduct.body.product.id

      const resProductGraduatedPrice = await chai
        .request(app)
        .post(`/api/products/${String(productId)}/graduated-prices`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productGraduatedPrice: {
            firstUnit: 1,
            lastUnit: 100,
            price: 15.12
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/product-graduated-prices/${String(resProductGraduatedPrice.body.productGraduatedPrice.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a graduated price that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/product-graduated-prices/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Product Graduated Price not found')
    })
  })

  describe('Get, update and delete a graduated price', () => {
    it('Should return 200 OK when an admin gets a graduated price by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Macbook Pro M1',
            jfsku: 'J34971M1',
            merchantSku: '42721M1',
            type: 'generic',
            productGroup: 'laptop'
          }
        })

      const productId = resProduct.body.product.id

      const resProductGraduatedPrice = await chai
        .request(app)
        .post(`/api/products/${String(productId)}/graduated-prices`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productGraduatedPrice: {
            firstUnit: 1,
            lastUnit: 100,
            price: 15.12
          }
        })

      const productGraduatedPriceId = resProductGraduatedPrice.body.productGraduatedPrice.id
      const res = await chai
        .request(app)
        .get(`/api/product-graduated-prices/${String(productGraduatedPriceId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productGraduatedPrice')
      expect(res.body.productGraduatedPrice).to.be.an('object')
      expect(res.body.productGraduatedPrice).to.include.keys('id', 'firstUnit', 'lastUnit', 'price', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a graduated price by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Macbook Pro M1',
            jfsku: 'J34971M1',
            merchantSku: '42721M1',
            type: 'generic',
            productGroup: 'laptop'
          }
        })

      const productId = resProduct.body.product.id

      const resProductGraduatedPrice = await chai
        .request(app)
        .post(`/api/products/${String(productId)}/graduated-prices`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productGraduatedPrice: {
            firstUnit: 1,
            lastUnit: 100,
            price: 15.12
          }
        })

      const productGraduatedPriceId = resProductGraduatedPrice.body.productGraduatedPrice.id

      const res = await chai
        .request(app)
        .put(`/api/product-graduated-prices/${String(productGraduatedPriceId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productGraduatedPrice: {
            firstUnit: 1,
            lastUnit: 100,
            price: 15.13
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productGraduatedPrice')
      expect(res.body.productGraduatedPrice).to.be.an('object')
      expect(res.body.productGraduatedPrice).to.include.keys('id', 'price', 'firstUnit', 'lastUnit', 'createdAt', 'updatedAt')
      expect(res.body.productGraduatedPrice.price).to.equal(15.13)
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a graduated price by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Macbook Pro M1',
            jfsku: 'J34971M1',
            merchantSku: '42721M1',
            type: 'generic',
            productGroup: 'laptop'
          }
        })

      const productId = resProduct.body.product.id

      const resProductGraduatedPrice = await chai
        .request(app)
        .post(`/api/products/${String(productId)}/graduated-prices`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productGraduatedPrice: {
            firstUnit: 1,
            lastUnit: 100,
            price: 15.12
          }
        })

      const productGraduatedPriceId = resProductGraduatedPrice.body.productGraduatedPrice.id

      const res = await chai
        .request(app)
        .put(`/api/product-graduated-prices/${String(productGraduatedPriceId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          productGraduatedPrice: {
            firstUnit: 1,
            lastUnit: 100,
            price: 15.12
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 200 OK when an administrator deletes a graduated price by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Macbook Pro M1',
            jfsku: 'J34971M1',
            merchantSku: '42721M1',
            type: 'generic',
            productGroup: 'laptop'
          }
        })

      const productId = resProduct.body.product.id

      const resProductGraduatedPrice = await chai
        .request(app)
        .post(`/api/products/${String(productId)}/graduated-prices`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productGraduatedPrice: {
            firstUnit: 1,
            lastUnit: 100,
            price: 15.12
          }
        })

      const productGraduatedPriceId = resProductGraduatedPrice.body.productGraduatedPrice.id

      const res = await chai
        .request(app)
        .delete(`/api/product-graduated-prices/${String(productGraduatedPriceId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })
  })
})
