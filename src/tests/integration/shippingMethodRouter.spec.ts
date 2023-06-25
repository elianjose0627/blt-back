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

describe('Shipping methods actions', () => {
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

  describe('Get all shipping methods', () => {
    it('Should return 200 Success when an admin successfully retrieves all shipping methods.', async () => {
      const res = await chai
        .request(app)
        .get('/api/shipping-methods')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'shippingMethods')
      expect(res.body.shippingMethods).to.be.an('array')
    })

    it('Should return 200 when a non-admin retrieves all shipping methods.', async () => {
      const res = await chai
        .request(app)
        .get('/api/shipping-methods')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'shippingMethods')
      expect(res.body.shippingMethods).to.be.an('array')
    })
  })

  describe('Create a shipping method', () => {
    it('Should return 201 Created when an admin creates a shipping method.', async () => {
      const res = await chai
        .request(app)
        .post('/api/shipping-methods')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          shippingMethod: {
            name: 'Test',
            shippingType: 1,
            isDropShipping: false
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'shippingMethod')
      expect(res.body.shippingMethod).to.be.an('object')
      expect(res.body.shippingMethod).to.include.keys('id', 'name', 'shippingType', 'isDropShipping', 'insuranceValue', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a user creates the same shipping method.', async () => {
      const res = await chai
        .request(app)
        .post('/api/shipping-methods')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          shippingMethod: {
            name: 'Test',
            shippingType: 1,
            isDropShipping: false
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'shippingMethod')
      expect(res.body.shippingMethod).to.be.an('object')
      expect(res.body.shippingMethod).to.include.keys('id', 'name', 'shippingType', 'isDropShipping', 'insuranceValue', 'createdAt', 'updatedAt')
    })

    it('Should return 204 when a admin deletes a shipping method.', async () => {
      const resShippingMethod = await chai
        .request(app)
        .post('/api/shipping-methods')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          shippingMethod: {
            name: 'Test',
            shippingType: 2,
            isDropShipping: false
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/shipping-methods/${String(resShippingMethod.body.shippingMethod.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a shipping method that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/shipping-methods/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('ShippingMethod not found')
    })
  })

  describe('Get, update and delete a shipping method', () => {
    it('Should return 200 OK when an owner gets a shipping method by id.', async () => {
      const resShippingMethod = await chai
        .request(app)
        .post('/api/shipping-methods')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          shippingMethod: {
            name: 'Test',
            shippingType: 3,
            isDropShipping: false
          }
        })

      const shippingMethodId = resShippingMethod.body.shippingMethod.id

      const res = await chai
        .request(app)
        .get(`/api/shipping-methods/${String(shippingMethodId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'shippingMethod')
      expect(res.body.shippingMethod).to.be.an('object')
      expect(res.body.shippingMethod).to.include.keys('id', 'name', 'shippingType', 'isDropShipping', 'insuranceValue', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator gets a shipping method by id.', async () => {
      const resShippingMethod = await chai
        .request(app)
        .post('/api/shipping-methods')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          shippingMethod: {
            name: 'Test',
            shippingType: 4,
            isDropShipping: false
          }
        })

      const shippingMethodId = resShippingMethod.body.shippingMethod.id

      const res = await chai
        .request(app)
        .get(`/api/shipping-methods/${String(shippingMethodId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'shippingMethod')
      expect(res.body.shippingMethod).to.be.an('object')
      expect(res.body.shippingMethod).to.include.keys('id', 'name', 'shippingType', 'isDropShipping', 'insuranceValue', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a shipping method by id.', async () => {
      const resShippingMethod = await chai
        .request(app)
        .post('/api/shipping-methods')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          shippingMethod: {
            name: 'Test',
            shippingType: 5,
            isDropShipping: false
          }
        })

      const shippingMethodId = resShippingMethod.body.shippingMethod.id

      const res = await chai
        .request(app)
        .put(`/api/shipping-methods/${String(shippingMethodId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          shippingMethod: {
            name: 'Test Updated',
            shippingType: 6,
            isDropShipping: false
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'shippingMethod')
      expect(res.body.shippingMethod).to.be.an('object')
      expect(res.body.shippingMethod).to.include.keys('id', 'name', 'shippingType', 'isDropShipping', 'insuranceValue', 'createdAt', 'updatedAt')
      expect(res.body.shippingMethod.name).to.equal('Test Updated')
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a shipping method by id.', async () => {
      const resShippingMethod = await chai
        .request(app)
        .post('/api/shipping-methods')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          shippingMethod: {
            name: 'Test',
            shippingType: 7,
            isDropShipping: false
          }
        })

      const shippingMethodId = resShippingMethod.body.shippingMethod.id

      const res = await chai
        .request(app)
        .put(`/api/shipping-methods/${String(shippingMethodId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          shippingMethod: {
            name: 'Test',
            shippingType: 7,
            isDropShipping: false
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 200 OK when an administrator deletes a shipping method by id.', async () => {
      const resShippingMethod = await chai
        .request(app)
        .post('/api/shipping-methods')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          shippingMethod: {
            name: 'Test',
            shippingType: 8,
            isDropShipping: false
          }
        })

      const shippingMethodId = resShippingMethod.body.shippingMethod.id

      const res = await chai
        .request(app)
        .delete(`/api/shipping-methods/${String(shippingMethodId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when an non-administrator tries to delete a shipping method by id.', async () => {
      const resShippingMethod = await chai
        .request(app)
        .post('/api/shipping-methods')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          shippingMethod: {
            name: 'Test',
            shippingType: 9,
            isDropShipping: false
          }
        })

      const shippingMethodId = resShippingMethod.body.shippingMethod.id

      const res = await chai
        .request(app)
        .delete(`/api/shipping-methods/${String(shippingMethodId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })
})
