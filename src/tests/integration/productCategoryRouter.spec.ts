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

describe('Product Category actions', () => {
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

  describe('Get all product categories', () => {
    it('Should return 200 Success when an admin successfully retrieves all product categories.', async () => {
      const res = await chai
        .request(app)
        .get('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCategories')
      expect(res.body.productCategories).to.be.an('array')
    })

    it('Should return 200 when a non-admin retrieves all product categories.', async () => {
      const res = await chai
        .request(app)
        .get('/api/product-categories')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCategories')
      expect(res.body.productCategories).to.be.an('array')
    })
  })

  describe('Create a product categories', () => {
    it('Should return 201 Created when an admin creates a product categories.', async () => {
      const res = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'technology'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCategory')
      expect(res.body.productCategory).to.be.an('object')
      expect(res.body.productCategory).to.include.keys('id', 'name', 'description', 'picture', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a user creates the same product category.', async () => {
      await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'office'
          }
        })

      const res = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'office'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCategory')
      expect(res.body.productCategory).to.be.an('object')
      expect(res.body.productCategory).to.include.keys('id', 'name', 'description', 'picture', 'createdAt', 'updatedAt')
    })

    it('Should return 204 when a admin deletes a product category.', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'Travel'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/product-categories/${String(resProductCategory.body.productCategory.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a product category that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/product-categories/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Product Category not found')
    })
  })

  describe('Get, update and delete a product category', () => {
    it('Should return 200 OK when an owner gets a product category by id.', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'Drinking'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const res = await chai
        .request(app)
        .get(`/api/product-categories/${String(productCategoryId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCategory')
      expect(res.body.productCategory).to.be.an('object')
      expect(res.body.productCategory).to.include.keys('id', 'name', 'description', 'picture', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator gets a product category by id.', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'Bags'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const res = await chai
        .request(app)
        .get(`/api/product-categories/${String(productCategoryId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCategory')
      expect(res.body.productCategory).to.be.an('object')
      expect(res.body.productCategory).to.include.keys('id', 'name', 'description', 'picture', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a product category by id.', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'Eating'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const res = await chai
        .request(app)
        .put(`/api/product-categories/${String(productCategoryId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'Foods'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCategory')
      expect(res.body.productCategory).to.be.an('object')
      expect(res.body.productCategory).to.include.keys('id', 'name', 'description', 'picture', 'createdAt', 'updatedAt')
      expect(res.body.productCategory.name).to.equal('foods')
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a product category by id.', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'Textile'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const res = await chai
        .request(app)
        .put(`/api/product-categories/${String(productCategoryId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          productCategory: {
            name: 'Textile and clothes'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 200 OK when an administrator deletes a product category by id.', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'Equipment'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const res = await chai
        .request(app)
        .delete(`/api/product-categories/${String(productCategoryId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when an non-administrator tries to delete a product category by id.', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'laptops'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const res = await chai
        .request(app)
        .delete(`/api/product-categories/${String(productCategoryId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })
})
