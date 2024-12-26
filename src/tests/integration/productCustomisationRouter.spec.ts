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
let productId: string

describe('Product Customisation actions', () => {
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

    const newProduct = await chai
      .request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        product: {
          jfsku: 'VZ9N01AKBKA',
          name: 'Lunch Box black',
          merchantSku: '10478',
          productGroup: 'general',
          type: 'generic',
          description: 'abc test'
        }
      })

    productId = String(newProduct.body.product.id)
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Create a product customisation', () => {
    it('Should return 201 Created when an user creates a product customisation.', async () => {
      const res = await chai
        .request(app)
        .post('/api/product-customisations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Two-color Print',
            price: 100,
            available: false,
            photo: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ],
            productId
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCustomisation')
      expect(res.body.productCustomisation).to.be.an('object')
      expect(res.body.productCustomisation).to.include.keys('id', 'customisationType', 'customisationDetail', 'price', 'available', 'photo', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a user creates the same product customisation.', async () => {
      await chai
        .request(app)
        .post('/api/product-customisations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Two-color Print',
            price: 100,
            available: false,
            photo: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ],
            productId
          }
        })

      const res = await chai
        .request(app)
        .post('/api/product-customisations')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Two-color Print',
            price: 100,
            available: false,
            photo: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ],
            productId
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCustomisation')
      expect(res.body.productCustomisation).to.be.an('object')
      expect(res.body.productCustomisation).to.include.keys('id', 'customisationType', 'customisationDetail', 'price', 'available', 'photo', 'createdAt', 'updatedAt')
    })

    it('Should return 404 NOT FOUNT when a user creates the a product customisation with fake product ID.', async () => {
      const res = await chai
        .request(app)
        .post('/api/product-customisations')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Two-color Print',
            price: 100,
            available: false,
            photo: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ],
            productId: '88D48647-ED1C-49CF-9D53-403D7DAD8DB7'
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Product not found')
    })
  })

  describe('Get all product customisations', () => {
    it('Should return 200 Success when an admin successfully retrieves all product customisations with productId.', async () => {
      await chai
        .request(app)
        .post('/api/product-customisations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Two-color Print',
            price: 100,
            available: false,
            photo: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ],
            productId
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/product-customisations?filter[productId]=${productId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCustomisations')
      expect(res.body.productCustomisations).to.be.an('array')
    })

    it('Should return 200 Success when a user retrieves all product customisatioins with productId.', async () => {
      const res = await chai
        .request(app)
        .get(`/api/product-customisations?filter[productId]=${productId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCustomisations')
      expect(res.body.productCustomisations).to.be.an('array')
    })

    it('Should return 200 Success when a user retrieves all product customisatioins with productId and search value.', async () => {
      const res = await chai
        .request(app)
        .get(`/api/product-customisations?filter[productId]=${productId}&search=engraving`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCustomisations')
      expect(res.body.productCustomisations).to.be.an('array')
    })

    it('Should return 200 Success when an admin successfully retrieves all product customisatioins with params.', async () => {
      const res = await chai
        .request(app)
        .get('/api/product-customisations')
        .query({
          limit: 10,
          page: 1,
          search: 'engraving',
          filter: {
            productId
          }
        })
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCustomisations')
      expect(res.body.productCustomisations).to.be.an('array')
    })

    it('Should return 422 Unprocessable Entity when a admin retrieves all product customiations wihout filter.', async () => {
      const res = await chai
        .request(app)
        .get('/api/product-customisations')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('A validation error has occured')
    })

    it('Should return 422 Unprocessable Entity when a admin retrieves all product customiations wihout productId.', async () => {
      const res = await chai
        .request(app)
        .get('/api/product-customisations?filter[color]=red')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('A validation error has occured')
    })

    it('Should return 422 Unprocessable Entity when a user retrieves all product customiations wihout filter.', async () => {
      const res = await chai
        .request(app)
        .get('/api/product-customisations')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('A validation error has occured')
    })

    it('Should return 422 Unprocessable Entity when a user retrieves all product customiations wihout productId.', async () => {
      const res = await chai
        .request(app)
        .get('/api/product-customisations?filter[color]=red')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('A validation error has occured')
    })
  })

  describe('Delete product customisation', () => {
    it('Should return 204 when a admin deletes a product customisation.', async () => {
      const resProductCustomisation = await chai
        .request(app)
        .post('/api/product-customisations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Two-color Print',
            price: 100,
            available: false,
            photo: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ],
            productId
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/product-customisations/${String(resProductCustomisation.body.productCustomisation.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 204 when a user deletes a product customisation.', async () => {
      const resProductCustomisation = await chai
        .request(app)
        .post('/api/product-customisations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Laser Engraving1',
            price: 100,
            available: false,
            photo: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ],
            productId
          }
        })
      const productCustomisationId = resProductCustomisation.body.productCustomisation.id

      const res = await chai
        .request(app)
        .delete(`/api/product-customisations/${String(productCustomisationId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when a non-owner-user tries to delete a product customisation.', async () => {
      const resProductCustomisation = await chai
        .request(app)
        .post('/api/product-customisations')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCustomisation: {
            customisationType: 'engraving',
            customisationDetail: 'Laser Engraving',
            price: 1000,
            available: false,
            photo: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ],
            productId
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/product-customisations/${String(resProductCustomisation.body.productCustomisation.id)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or admin can perform this action')
    })

    it('Should return 404 when a admin tries to delete a product customisation that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/product-customisations/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('ProductCustomisation not found')
    })
  })

  describe('Update a product customisation', () => {
    it('Should return 200 OK when an user updates a product customisation by id.', async () => {
      const resProductCustomisation = await chai
        .request(app)
        .post('/api/product-customisations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Laser Engraving',
            price: 100,
            available: false,
            photo: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ],
            productId
          }
        })

      const productCustomisationId = resProductCustomisation.body.productCustomisation.id

      const res = await chai
        .request(app)
        .put(`/api/product-customisations/${String(productCustomisationId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Two-color Print',
            price: 1000,
            available: false,
            photo: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ],
            productId
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCustomisation')
      expect(res.body.productCustomisation).to.be.an('object')
      expect(res.body.productCustomisation).to.include.keys('id', 'customisationType', 'customisationDetail', 'price', 'available', 'photo', 'createdAt', 'updatedAt')
      expect(res.body.productCustomisation.customisationType).to.equal('print')
      expect(res.body.productCustomisation.customisationDetail).to.equal('Two-color Print')
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a product customisation by id.', async () => {
      const resProductCustomisation = await chai
        .request(app)
        .post('/api/product-customisations')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCustomisation: {
            customisationType: 'engraving',
            customisationDetail: 'Laser Engraving',
            price: 1000,
            available: false,
            photo: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ],
            productId
          }
        })

      const productCustomisationId = resProductCustomisation.body.productCustomisation.id

      const res = await chai
        .request(app)
        .put(`/api/product-customisations/${String(productCustomisationId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          productCustomisation: {
            name: 'yellow',
            hexCode: '#ffff00'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or admin can perform this action')
    })
  })
})
