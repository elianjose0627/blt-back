import chai from 'chai'
import chaiHttp from 'chai-http'
import { v1 as uuidv1 } from 'uuid'
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

describe('Product Category Tag actions', () => {
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

  describe('Get all product category tags', () => {
    it('Should return 200 Success when an admin successfully retrieves all product category tags.', async () => {
      const res = await chai
        .request(app)
        .get('/api/product-category-tags')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCategoryTags')
      expect(res.body.productCategoryTags).to.be.an('array')
    })

    it('Should return 200 when a non-admin retrieves all product category tags.', async () => {
      const res = await chai
        .request(app)
        .get('/api/product-category-tags')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCategoryTags')
      expect(res.body.productCategoryTags).to.be.an('array')
    })

    it('Should return 200 when a non-admin retrieves all product category tags with search params.', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'Camera'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'dslr'
          }
        })
      const res = await chai
        .request(app)
        .get('/api/product-category-tags')
        .set('Authorization', `Bearer ${token}`)
        .query({
          search: 'dslr'
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCategoryTags')
      expect(res.body.productCategoryTags).to.be.an('array')
    })
  })

  describe('Get, update and delete a product category tag', () => {
    it('Should return 200 OK when an owner gets a product category tag by id.', async () => {
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

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'soda'
          }
        })

      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const res = await chai
        .request(app)
        .get(`/api/product-category-tags/${String(productCategoryTagId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCategoryTag')
      expect(res.body.productCategoryTag).to.be.an('object')
      expect(res.body.productCategoryTag).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 404 Not Found when an owner gets a product category tag that does not exist.', async () => {
      const res = await chai
        .request(app)
        .get(`/api/product-category-tags/${uuidv1()}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Product Category Tag not found')
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

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'women'
          }
        })

      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const res = await chai
        .request(app)
        .get(`/api/product-category-tags/${String(productCategoryTagId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCategoryTag')
      expect(res.body.productCategoryTag).to.be.an('object')
      expect(res.body.productCategoryTag).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a product category tag by id.', async () => {
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

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'lunch'
          }
        })

      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const res = await chai
        .request(app)
        .put(`/api/product-category-tags/${String(productCategoryTagId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'brunch'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCategoryTag')
      expect(res.body.productCategoryTag).to.be.an('object')
      expect(res.body.productCategoryTag).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
      expect(res.body.productCategoryTag.name).to.equal('brunch')
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a product category tag by id.', async () => {
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

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'trouser'
          }
        })

      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const res = await chai
        .request(app)
        .put(`/api/product-category-tags/${String(productCategoryTagId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          productCategoryTag: {
            name: 'shorts'
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

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'hammer'
          }
        })

      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const res = await chai
        .request(app)
        .delete(`/api/product-category-tags/${String(productCategoryTagId)}`)
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

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'hammer'
          }
        })

      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const res = await chai
        .request(app)
        .delete(`/api/product-category-tags/${String(productCategoryTagId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })
})
