import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  iversAtKreeDotKrPassword,
  sheHulkAtStarkIndustriesPassword,
  createCompanyAdministrator,
  createCampaignManager,
  happyHoganPassword,
  nickFuryPassword,
  createVerifiedCompany
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let tokenCompanyAdministrator: string
let tokenCampaignManager: string
let token: string
let productId: string
let userIdAdmin: string

describe('Product Customisation actions', () => {
  before(async () => {
    await createAdminTestUser()
    await createCompanyAdministrator()
    await createCampaignManager()

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

    const resCampaignManager = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

    const resCompanyAdministrator = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

    const resProduct = await chai
      .request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${String(resAdmin.body.token)}`)
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

    tokenAdmin = resAdmin.body.token
    tokenCompanyAdministrator = resCompanyAdministrator.body.token
    tokenCampaignManager = resCampaignManager.body.token
    token = resUser.body.token
    userIdAdmin = resAdmin.body.user.id
    productId = String(resProduct.body.product.id)
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Get product customisations by id', () => {
    it('Should return 200 OK when an admin successfully retrieves product customisation by id.', async () => {
      const productCustomiationRes = await chai
        .request(app)
        .post(`/api/products/${productId}/product-customisations`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Two-color Print',
            price: 100,
            isApproved: false,
            designStatus: 'Laser Engraving',
            color: 'red',
            photos: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ]
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/product-customisations/${String(productCustomiationRes.body.productCustomisation.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCustomisation')
      expect(res.body.productCustomisation).to.be.an('object')
    })

    it('Should return 422 Unprocessable Entity when an admin tries to retrieve a product customisations with invalid product customiation id.', async () => {
      const res = await chai
        .request(app)
        .get('/api/product-customisations/23')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('A validation error has occurred')
    })
  })

  describe('Delete product customisation', () => {
    it('Should return 204 when a admin deletes a product customisation.', async () => {
      const resProductCustomisation = await chai
        .request(app)
        .post(`/api/products/${productId}/product-customisations`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Two-color Print',
            price: 100,
            isApproved: false,
            designStatus: 'Laser Engraving',
            color: 'red',
            photos: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ]
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/product-customisations/${String(resProductCustomisation.body.productCustomisation.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when a campaign manager with no access permission tries to delete a product customisation that belongs to the company.', async () => {
      const resCompany = await createVerifiedCompany(userIdAdmin)

      const companyId = resCompany.id

      await deleteTestUser('happyhogan@starkindustriesmarvel.com')
      await createCampaignManager()

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      await createCompanyAdministrator()

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const resCompanyProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            jfsku: 'VZ9N07AKXKA',
            name: 'Lunch Box BLUE',
            merchantSku: '10479-blue',
            productGroup: 'general',
            type: 'generic',
            description: 'abc test',
            companyId
          }
        })

      const companyProductId = String(resCompanyProduct.body.product.id)

      const resProductCustomisation = await chai
        .request(app)
        .post(`/api/products/${companyProductId}/product-customisations`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Two-color Print',
            price: 100,
            isApproved: false,
            designStatus: 'Laser Engraving',
            color: 'red',
            photos: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ]
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/product-customisations/${String(resProductCustomisation.body.productCustomisation.id)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })

    it('Should return 204 No Content when a company administrator successfully deletes a product customisation that belongs to the company.', async () => {
      const resCompany = await createVerifiedCompany(userIdAdmin)

      const companyId = resCompany.id

      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const resCompanyProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            jfsku: 'VZ9N39AKXKA',
            name: 'Lunch Box RED',
            merchantSku: '10479-red',
            productGroup: 'general',
            type: 'generic',
            description: 'abc test',
            companyId
          }
        })

      const companyProductId = String(resCompanyProduct.body.product.id)

      const resProductCustomisation = await chai
        .request(app)
        .post(`/api/products/${companyProductId}/product-customisations`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Two-color Print',
            price: 100,
            isApproved: false,
            designStatus: 'Laser Engraving',
            color: 'red',
            photos: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ]
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/product-customisations/${String(resProductCustomisation.body.productCustomisation.id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when a campaign manager tries to delete a product customisation that does not belong to the company.', async () => {
      const resCompany = await createVerifiedCompany(userIdAdmin)

      const companyId = resCompany.id

      await deleteTestUser('happyhogan@starkindustriesmarvel.com')
      await createCampaignManager()

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const resProductCustomisation = await chai
        .request(app)
        .post(`/api/products/${productId}/product-customisations`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Two-color Print',
            price: 100,
            isApproved: false,
            designStatus: 'Laser Engraving',
            color: 'red',
            photos: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ]
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/product-customisations/${String(resProductCustomisation.body.productCustomisation.id)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, employee or admin can perform this action')
    })

    it('Should return 403 Forbidden when a user who is not an owner or admin tries to delete a product customisation.', async () => {
      const resProductCustomisation = await chai
        .request(app)
        .post(`/api/products/${productId}/product-customisations`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Two-color Print',
            price: 100,
            isApproved: false,
            designStatus: 'Laser Engraving',
            color: 'red',
            photos: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ]
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/product-customisations/${String(resProductCustomisation.body.productCustomisation.id)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, employee or admin can perform this action')
    })

    it('Should return 404 when a admin tries to delete a product customisation that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/product-customisations/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Product Customisation not found')
    })
  })

  describe('Update a product customisation', () => {
    it('Should return 200 OK when an admin updates a product customisation by id.', async () => {
      const resProductCustomisation = await chai
        .request(app)
        .post(`/api/products/${productId}/product-customisations`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCustomisation: {
            customisationType: 'engraving',
            customisationDetail: 'Laizer engraving',
            price: 100,
            isApproved: false,
            designStatus: 'Laser Engraving',
            color: 'red',
            photos: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ]
          }
        })

      const productCustomisationId = resProductCustomisation.body.productCustomisation.id

      const res = await chai
        .request(app)
        .put(`/api/product-customisations/${String(productCustomisationId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Two-color Print',
            price: 200,
            isApproved: false,
            designStatus: 'Laser Engraving',
            color: 'red',
            photos: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ]
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productCustomisation')
      expect(res.body.productCustomisation).to.be.an('object')
      expect(res.body.productCustomisation).to.include.keys('id', 'customisationType', 'customisationDetail', 'price', 'available', 'designStatus', 'color', 'photos', 'createdAt', 'updatedAt')
      expect(res.body.productCustomisation.customisationType).to.equal('print')
      expect(res.body.productCustomisation.price).to.equal(200)
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a product customisation by id.', async () => {
      const resProductCustomisation = await chai
        .request(app)
        .post(`/api/products/${productId}/product-customisations`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCustomisation: {
            customisationType: 'engraving',
            customisationDetail: 'Laser Engraving',
            price: 1000,
            available: false,
            designStatus: 'Laser Engraving',
            color: 'red',
            photos: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ]
          }
        })

      const productCustomisationId = resProductCustomisation.body.productCustomisation.id

      const res = await chai
        .request(app)
        .put(`/api/product-customisations/${String(productCustomisationId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          productCustomisation: {
            customisationType: 'engraving',
            customisationDetail: 'Laser Engraving',
            price: 1000,
            available: false,
            designStatus: 'Laser Engraving',
            color: 'red',
            photos: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ]
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, employee or admin can perform this action')
    })
  })

  describe('Create and Get a product customisation chat', () => {
    it('Should return 201 CREATED when an admin creates a chat', async () => {
      const resProductCustomisation = await chai
        .request(app)
        .post(`/api/products/${productId}/product-customisations`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Laser Engraving',
            price: 100,
            available: false,
            designStatus: 'Laser Engraving',
            color: 'red',
            photos: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ]
          }
        })

      const productCustomisationId = resProductCustomisation.body.productCustomisation.id
      const res = await chai
        .request(app)
        .post(`/api/product-customisations/${String(productCustomisationId)}/chat`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCustomisationChat: {
            message: 'Add the new logo to the bottom of the article and make it as big as possible',
            attachment: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ]
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'ProductCustomisationChat')
      expect(res.body.ProductCustomisationChat).to.be.an('object')
      expect(res.body.ProductCustomisationChat).to.include.keys('id', 'message', 'attachment', 'createdAt', 'updatedAt')
    })

    it('Should return 201 CREATED when an admin creates a chat without an attachment', async () => {
      const resProductCustomisation = await chai
        .request(app)
        .post(`/api/products/${productId}/product-customisations`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Laser Engraving',
            price: 100,
            available: false,
            designStatus: 'Laser Engraving',
            color: 'red',
            photos: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ]
          }
        })

      const productCustomisationId = resProductCustomisation.body.productCustomisation.id
      const res = await chai
        .request(app)
        .post(`/api/product-customisations/${String(productCustomisationId)}/chat`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCustomisationChat: {
            message: 'Add the new logo to the bottom of the article and make it as big as possible',
            attachment: []
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'ProductCustomisationChat')
      expect(res.body.ProductCustomisationChat).to.be.an('object')
      expect(res.body.ProductCustomisationChat).to.include.keys('id', 'message', 'attachment', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an admin gets all chats', async () => {
      const resProductCustomisation = await chai
        .request(app)
        .post(`/api/products/${productId}/product-customisations`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCustomisation: {
            customisationType: 'print',
            customisationDetail: 'Laser Engraving',
            price: 100,
            available: false,
            designStatus: 'Laser Engraving',
            color: 'red',
            photos: [
              {
                url: 'https://google.com',
                filename: 'file.jpg'
              }
            ]
          }
        })

      const productCustomisationId = resProductCustomisation.body.productCustomisation.id
      await chai
        .request(app)
        .post(`/api/product-customisations/${String(productCustomisationId)}/chat`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCustomisationChat: {
            message: 'Test Message',
            attachment: []
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/product-customisations/${String(productCustomisationId)}/chat`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'ProductCustomisationChats')
      expect(res.body.ProductCustomisationChats).to.be.an('array')
      expect(res.body.ProductCustomisationChats[0].message).to.equal('Test Message')
    })
  })
})
