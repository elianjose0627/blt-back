import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  createVerifiedUser,
  createVerifiedCompany
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string

describe('Product Access Control Group actions', () => {
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

  describe('Get all product access control groups', () => {
    it('Should return 200 Success when an admin successfully retrieves all product access control groups.', async () => {
      await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Two'
          }
        })

      const res = await chai
        .request(app)
        .get('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productAccessControlGroups')
      expect(res.body.productAccessControlGroups).to.be.an('array').lengthOf.above(0)
    })
  })

  describe('Create a access control group', () => {
    it('Should return 201 Created when an admin creates a product access control group.', async () => {
      const res = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'productAccessControlGroup')
      expect(res.body.productAccessControlGroup).to.be.an('object')
      expect(res.body.productAccessControlGroup).to.include.keys('id', 'name', 'description', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a admin creates the same product access control group.', async () => {
      await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Three'
          }
        })

      const res = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Three'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productAccessControlGroup')
      expect(res.body.productAccessControlGroup).to.be.an('object')
      expect(res.body.productAccessControlGroup).to.include.keys('id', 'name', 'description', 'createdAt', 'updatedAt')
    })

    it('Should return 204 when a admin deletes a product access control group.', async () => {
      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Four'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/product-access-control-groups/${String(resProductAccessControlGroup.body.productAccessControlGroup.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a product access control group that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/product-access-control-groups/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Product Access Control Group not found')
    })
  })

  describe('Get, update and delete a product size', () => {
    it('Should return 200 OK when an admin gets a product access control group by id.', async () => {
      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Five'
          }
        })

      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      const res = await chai
        .request(app)
        .get(`/api/product-access-control-groups/${String(productAccessControlGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productAccessControlGroup')
      expect(res.body.productAccessControlGroup).to.be.an('object')
      expect(res.body.productAccessControlGroup).to.include.keys('id', 'name', 'description', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a product access control group by id.', async () => {
      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Five'
          }
        })

      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      const res = await chai
        .request(app)
        .put(`/api/product-access-control-groups/${String(productAccessControlGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Fiver'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productAccessControlGroup')
      expect(res.body.productAccessControlGroup).to.be.an('object')
      expect(res.body.productAccessControlGroup).to.include.keys('id', 'name', 'description', 'createdAt', 'updatedAt')
      expect(res.body.productAccessControlGroup.name).to.equal('Test Access Control Group Fiver')
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a product access control group by id.', async () => {
      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Six'
          }
        })

      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      const res = await chai
        .request(app)
        .put(`/api/product-access-control-groups/${String(productAccessControlGroupId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Fiver'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 200 OK when an administrator deletes a product product access control group by id.', async () => {
      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Seven'
          }
        })

      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      const res = await chai
        .request(app)
        .delete(`/api/product-access-control-groups/${String(productAccessControlGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when an non-administrator tries to delete a product size by id.', async () => {
      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Eight'
          }
        })

      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      const res = await chai
        .request(app)
        .delete(`/api/product-access-control-groups/${String(productAccessControlGroupId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })

  describe('Product Access Control Group Product Category Tag actions', () => {
    it('Should return 200 when a new product category tag is added to a product access control group', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'jackets'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'super admin',
            type: 'security'
          }
        })

      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Nine'
          }
        })
      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      const res = await chai
        .request(app)
        .post(`/api/product-access-control-groups/${String(productAccessControlGroupId)}/product-category-tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTagProductAccessControlGroup: {
            productCategoryTagIds: [
              productCategoryTagId
            ]
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCategoryTagProductAccessControlGroup')
      expect(res.body.productCategoryTagProductAccessControlGroup).to.be.an('object')
      expect(res.body.productCategoryTagProductAccessControlGroup).to.include.keys('updated', 'added')
      expect(res.body.productCategoryTagProductAccessControlGroup.added).to.be.an('array').lengthOf(1)
      expect(res.body.productCategoryTagProductAccessControlGroup.updated).to.be.an('array').lengthOf(0)
    })

    it('Should return 200 when an existing product category tag is added to a product access control group', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'trousers'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'super admin',
            type: 'security'
          }
        })

      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Ten'
          }
        })
      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      await chai
        .request(app)
        .post(`/api/product-access-control-groups/${String(productAccessControlGroupId)}/product-category-tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTagProductAccessControlGroup: {
            productCategoryTagIds: [
              productCategoryTagId
            ]
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/product-access-control-groups/${String(productAccessControlGroupId)}/product-category-tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTagProductAccessControlGroup: {
            productCategoryTagIds: [
              productCategoryTagId
            ]
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCategoryTagProductAccessControlGroup')
      expect(res.body.productCategoryTagProductAccessControlGroup).to.be.an('object')
      expect(res.body.productCategoryTagProductAccessControlGroup).to.include.keys('updated', 'added')
      expect(res.body.productCategoryTagProductAccessControlGroup.added).to.be.an('array').lengthOf(0)
      expect(res.body.productCategoryTagProductAccessControlGroup.updated).to.be.an('array').lengthOf(1)
    })
  })

  describe('Product Access Control Group User actions', () => {
    it('Should return 200 when a new user is added to a product access control group', async () => {
      const resNewUser = await createVerifiedUser('user@accesscontrol.com', '1234567890')

      const userId = resNewUser.id

      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Eleven'
          }
        })
      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      const res = await chai
        .request(app)
        .post(`/api/product-access-control-groups/${String(productAccessControlGroupId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          userProductAccessControlGroup: {
            userIds: [
              userId
            ]
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'userProductAccessControlGroup')
      expect(res.body.userProductAccessControlGroup).to.be.an('object')
      expect(res.body.userProductAccessControlGroup).to.include.keys('updated', 'added')
      expect(res.body.userProductAccessControlGroup.added).to.be.an('array').lengthOf(1)
      expect(res.body.userProductAccessControlGroup.updated).to.be.an('array').lengthOf(0)
    })

    it('Should return 200 when an existing user is added to a product access control group', async () => {
      const resNewUser = await createVerifiedUser('user2@accesscontrol.com', '1234567890')

      const userId = resNewUser.id

      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Twelve'
          }
        })
      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      await chai
        .request(app)
        .post(`/api/product-access-control-groups/${String(productAccessControlGroupId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          userProductAccessControlGroup: {
            userIds: [
              userId
            ]
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/product-access-control-groups/${String(productAccessControlGroupId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          userProductAccessControlGroup: {
            userIds: [
              userId
            ]
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'userProductAccessControlGroup')
      expect(res.body.userProductAccessControlGroup).to.be.an('object')
      expect(res.body.userProductAccessControlGroup).to.include.keys('updated', 'added')
      expect(res.body.userProductAccessControlGroup.added).to.be.an('array').lengthOf(0)
      expect(res.body.userProductAccessControlGroup.updated).to.be.an('array').lengthOf(1)
    })
  })

  describe('Product Access Control Group Company actions', () => {
    it('Should return 200 when a new user is added to a product access control group', async () => {
      const resNewUser = await createVerifiedUser('user3@accesscontrol.com', '1234567890')

      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user3@accesscontrol.com', 'accesscontrol.com')

      const companyId = resNewCompany.id

      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Thirteen'
          }
        })
      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      const res = await chai
        .request(app)
        .post(`/api/product-access-control-groups/${String(productAccessControlGroupId)}/companies`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyProductAccessControlGroup: {
            companyIds: [
              companyId
            ]
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companyProductAccessControlGroup')
      expect(res.body.companyProductAccessControlGroup).to.be.an('object')
      expect(res.body.companyProductAccessControlGroup).to.include.keys('updated', 'added')
      expect(res.body.companyProductAccessControlGroup.added).to.be.an('array').lengthOf(1)
      expect(res.body.companyProductAccessControlGroup.updated).to.be.an('array').lengthOf(0)
    })

    it('Should return 200 when an existing company is added to a product access control group', async () => {
      const resNewUser = await createVerifiedUser('user4@accesscontrol.com', '1234567890')

      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user4@accesscontrol.com', 'accesscontrol.com')

      const companyId = resNewCompany.id

      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Forteen'
          }
        })
      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      await chai
        .request(app)
        .post(`/api/product-access-control-groups/${String(productAccessControlGroupId)}/companies`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyProductAccessControlGroup: {
            companyIds: [
              companyId
            ]
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/product-access-control-groups/${String(productAccessControlGroupId)}/companies`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyProductAccessControlGroup: {
            companyIds: [
              companyId
            ]
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companyProductAccessControlGroup')
      expect(res.body.companyProductAccessControlGroup).to.be.an('object')
      expect(res.body.companyProductAccessControlGroup).to.include.keys('updated', 'added')
      expect(res.body.companyProductAccessControlGroup.added).to.be.an('array').lengthOf(0)
      expect(res.body.companyProductAccessControlGroup.updated).to.be.an('array').lengthOf(1)
    })
  })
})
