import chai from 'chai'
import chaiHttp from 'chai-http'
import { faker } from '@faker-js/faker'
import app from '../../app'
import {
  deleteTestUser, createAdminTestUser,
  createCompanyAdministrator, createCampaignManager,
  createVerifiedCompany, verifyUser, verifyCompanyDomain,
  iversAtKreeDotKrPassword,
  sheHulkAtStarkIndustriesPassword,
  happyHoganPassword,
  nickFuryPassword
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let token: string
let tokenAdmin: string
let tokenAdminTwo: string
let tokenCompanyAdmin: string
let tokenCampaignManager: string
let userIdAdmin: string

describe('Product Stock Notification actions', () => {
  before(async () => {
    await createAdminTestUser('iversone@kree.kr')
    await createAdminTestUser('iverstwo@kree.kr')
    await createCompanyAdministrator()
    await createCampaignManager()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustriesmarvel.com', phone: '254720123456', password: sheHulkAtStarkIndustriesPassword } })

    await verifyUser('shehulk@starkindustriesmarvel.com')

    const res1 = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: sheHulkAtStarkIndustriesPassword } })

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'iversone@kree.kr', password: iversAtKreeDotKrPassword } })

    const resAdminTwo = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'iverstwo@kree.kr', password: iversAtKreeDotKrPassword } })

    const resCompanyAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

    const resCampaignManager = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

    token = res1.body.token
    tokenAdmin = resAdmin.body.token
    tokenAdminTwo = resAdminTwo.body.token
    tokenCompanyAdmin = resCompanyAdmin.body.token
    tokenCampaignManager = resCampaignManager.body.token
    userIdAdmin = resAdmin.body.user.id
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Delete a product stock notification by id', () => {
    it('Should return 204 No Content when an admin successfully deletes a product stock notification.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Product Stock Notification',
            email: 'ivers@kree.kr'
          }
        })

      const companyId = resCompany.body.company.id

      await verifyCompanyDomain(String(companyId))

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            companyId,
            name: 'Soda Water',
            jfsku: '12371-4',
            merchantSku: '12371-4',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const resProductStockNotification = await chai
        .request(app)
        .post(`/api/products/${String(resProduct.body.product.id)}/stock-notifications`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productStockNotification: {
            quantity: 2,
            recipients: [faker.internet.email(), faker.internet.email()]
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/product-stock-notifications/${String(resProductStockNotification.body.productStockNotification.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 204 No Content when a company admin successfully deletes a product stock notification.', async () => {
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

      const resCompanyAdmin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdmin = resCompanyAdmin.body.token

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            companyId,
            name: 'Soda Water',
            jfsku: '12371-3',
            merchantSku: '12371-3',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const resProductStockNotification = await chai
        .request(app)
        .post(`/api/products/${String(resProduct.body.product.id)}/stock-notifications`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productStockNotification: {
            quantity: 2,
            recipients: [faker.internet.email(), faker.internet.email()]
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/product-stock-notifications/${String(resProductStockNotification.body.productStockNotification.id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when a campaign manager with no access permissions tries to delete a product stock notification.', async () => {
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

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            companyId,
            name: 'Soda Water',
            jfsku: '12371-3',
            merchantSku: '12371-3',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const resProductStockNotification = await chai
        .request(app)
        .post(`/api/products/${String(resProduct.body.product.id)}/stock-notifications`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productStockNotification: {
            quantity: 2,
            recipients: [faker.internet.email(), faker.internet.email()]
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/product-stock-notifications/${String(resProductStockNotification.body.productStockNotification.id)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })

    it('Should return 403 Forbidden when a user tries to delete a product stock notification.', async () => {
      const resCompany = await createVerifiedCompany(userIdAdmin)

      const companyId = resCompany.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            companyId,
            name: 'Soda Water',
            jfsku: '12371-2',
            merchantSku: '12371-2',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const resProductStockNotification = await chai
        .request(app)
        .post(`/api/products/${String(resProduct.body.product.id)}/stock-notifications`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productStockNotification: {
            quantity: 23,
            recipients: [faker.internet.email(), faker.internet.email()]
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/product-stock-notifications/${String(resProductStockNotification.body.productStockNotification.id)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, admin or employee can perform this action')
    })
  })

  describe('Update a product stock notification by id', () => {
    it('Should return 200 OK when an admin successfully updates a product stock notification.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Product Stock Notification',
            email: 'ivers@kree.kr'
          }
        })

      const companyId = resCompany.body.company.id

      await verifyCompanyDomain(String(companyId))

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            companyId,
            name: 'Soda Water',
            jfsku: '12371-1',
            merchantSku: '12371-1',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const resProductStockNotification = await chai
        .request(app)
        .post(`/api/products/${String(resProduct.body.product.id)}/stock-notifications`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productStockNotification: {
            quantity: 2,
            recipients: [faker.internet.email(), faker.internet.email()]
          }
        })

      const recipients = [faker.internet.email(), faker.internet.email()]

      const res = await chai
        .request(app)
        .put(`/api/product-stock-notifications/${String(resProductStockNotification.body.productStockNotification.id)}`)
        .set('Authorization', `Bearer ${tokenAdminTwo}`)
        .send({
          productStockNotification: {
            quantity: 2,
            recipients
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productStockNotification')
      expect(res.body.productStockNotification.quantity).to.equal(2)
      expect(res.body.productStockNotification.recipients).to.deep.equal(recipients)
      expect(res.body.productStockNotification.frequency).to.equal(1)
      expect(res.body.productStockNotification.frequencyUnit).to.equal('month')
      expect(res.body.productStockNotification.lastSentAt).to.equal(null)
    })
  })
})
