import chai from 'chai'
import chaiHttp from 'chai-http'
import dayjs from 'dayjs'
import fs from 'fs'
import path from 'path'
import { faker } from '@faker-js/faker'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  verifyCompanyDomain,
  pendingOrders,
  pendingOrderForUpdate,
  updatePendingOrderWithPostedOrderId,
  createCompanyAdministrator,
  createVerifiedUser,
  createCompanyAdministratorWithCompany,
  createProduct,
  createProductWithMinimumOrderQuantity,
  createProductWithGraduatedPricesAndIsExceedStockEnabledIsTrue,
  sharonCarterPassword,
  createCampaignManager,
  createPostedPendingOrder,
  createQueuedPendingOrder
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string
let tokenCompanyAdministrator: string
let tokenCampaignManager: string
let userIdAdmin: string

const email1 = 'gues@modo.com'
const password1 = faker.internet.password()
const email2 = 'guses@yahoo.com'
const password2 = faker.internet.password()
const email3 = 'faker.internet@google.com'
const password3 = faker.internet.password()
const email4 = 'guesmia@getec.com'
const password4 = faker.internet.password()
const email5 = 'faker.user@getec.com'
const password5 = faker.internet.password()
const username5 = 'fakeruser'
const campaignManagerPassword = faker.internet.password()

describe('Pending Orders actions', () => {
  before(async () => {
    await createAdminTestUser(email1, password1)
    await createCompanyAdministrator(email2, password2)
    await createProduct()
    await createProductWithMinimumOrderQuantity()
    await createProductWithGraduatedPricesAndIsExceedStockEnabledIsTrue()
    await createCompanyAdministratorWithCompany('sharoncarterthree@starkindustriesmarvel2.com')
    await createCampaignManager('drminerva@kree.kr', campaignManagerPassword)
    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: email1, password: password1 } })

    const resCompanyAdministrator = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: email2, password: password2 } })

    tokenAdmin = resAdmin.body.token
    tokenCompanyAdministrator = resCompanyAdministrator.body.token
    userIdAdmin = resAdmin.body.user.id

    // get company invite link
    const companyId = resCompanyAdministrator.body.user.company.id
    await verifyCompanyDomain(companyId)
    const resInviteLink = await chai
      .request(app)
      .get(`/api/companies/${String(companyId)}/invite-link`)
      .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

    // create user
    await chai
      .request(app)
      .post('/auth/signup')
      .query({
        companyId: resInviteLink.body.company.inviteLink.split('=')[1]
      })
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: email3, phone: '254720123456', password: password3 } })

    await verifyUser(email3)

    const resUser = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: email3, password: password3 } })

    // create campaign manager
    await chai
      .request(app)
      .post('/auth/signup')
      .query({
        companyId: resInviteLink.body.company.roles.campaignManager.shortInviteLink.split('=')[1]
      })
      .send({ user: { firstName: 'Happy', lastName: 'Hogan', email: email4, phone: '254720123456', password: password4 } })

    await verifyUser(email4)

    const resCampaignManager = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: email4, password: password4 } })

    token = resUser.body.token
    tokenCampaignManager = resCampaignManager.body.token

    const res = await createCompanyAdministratorWithCompany(email5, password5, '123')
    await verifyUser(email5)
    const res2 = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: email5, password: password5 } })

    const token5 = res2.body.token

    await chai
      .request(app)
      .put(`/api/users/${String(res.id)}`)
      .set('Authorization', `Bearer ${String(token5)}`)
      .send({ user: { username: username5 } })
  })

  after(async () => {
    await deleteTestUser(email1)
    await deleteTestUser(email2)
    await deleteTestUser(email3)
    await deleteTestUser(email4)
    await deleteTestUser(email5)
  })

  describe('Get all pending orders', () => {
    it('Should return 200 Success when an admin successfully retrieves all pending orders.', async () => {
      const res = await chai
        .request(app)
        .get('/api/pending-orders')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array')
    })

    it('Should return 200 Success when a company administrator successfully retrieves all pending orders.', async () => {
      const res = await chai
        .request(app)
        .get('/api/pending-orders')
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array')
    })

    it('Should return 200 Success when a campaign manager successfully retrieves all pending orders.', async () => {
      const res = await chai
        .request(app)
        .get('/api/pending-orders')
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array')
    })

    it('Should return 200 Success when an user successfully retrieves all pending orders.', async () => {
      const res = await chai
        .request(app)
        .get('/api/pending-orders')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array')
    })
  })

  describe('Create a pending order', () => {
    it('Should return 201 Created when a user creates an order', async () => {
      const randomPassword = faker.internet.password()
      await createVerifiedUser('mantis101@gotg.com', randomPassword)
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'mantis101@gotg.com', password: randomPassword } })

      const tokenUser = resUser.body.token

      const res = await chai
        .request(app)
        .post('/api/pending-orders')
        .set('Authorization', `Bearer ${String(tokenUser)}`)
        .send({
          pendingOrders
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array')
      expect(res.body.pendingOrders).to.have.lengthOf.above(0)
    })

    it('Should return 201 Created when a company admin with company that has a customerId creates an order', async () => {
      const randomPassword = faker.internet.password()
      await createCompanyAdministratorWithCompany('mantis102@gotg.com', randomPassword, '040')
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'mantis102@gotg.com', password: randomPassword } })

      const tokenUser = resUser.body.token

      const res = await chai
        .request(app)
        .post('/api/pending-orders')
        .set('Authorization', `Bearer ${String(tokenUser)}`)
        .send({
          pendingOrders
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array')
      expect(res.body.pendingOrders).to.have.lengthOf.above(0)
    })

    it('Should return 201 Created when a company admin with company that has no customerId creates an order', async () => {
      const randomPassword = faker.internet.password()
      await createCompanyAdministratorWithCompany('mantis103@gotg.com', randomPassword)
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'mantis103@gotg.com', password: randomPassword } })

      const tokenUser = resUser.body.token

      const res = await chai
        .request(app)
        .post('/api/pending-orders')
        .set('Authorization', `Bearer ${String(tokenUser)}`)
        .send({
          pendingOrders
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array')
      expect(res.body.pendingOrders).to.have.lengthOf.above(0)
    })

    it('Should return 404 Not Found when a user creates an order with an article that does not exist', async () => {
      const randomPassword = faker.internet.password()
      await createVerifiedUser('mantis104@gotg.com', randomPassword)
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'mantis104@gotg.com', password: randomPassword } })

      const tokenUser = resUser.body.token

      const res = await chai
        .request(app)
        .post('/api/pending-orders')
        .set('Authorization', `Bearer ${String(tokenUser)}`)
        .send({
          pendingOrders: [
            {
              costCenter: '',
              platform: 0,
              language: 0,
              currency: 'EUR',
              orderNo: '0',
              inetorderno: 0,
              shippingId: 21,
              shipped: dayjs.utc().add(1, 'day'),
              deliverydate: dayjs.utc().add(1, 'day'),
              note: '',
              description: ' +',
              paymentType: 0,
              paymentTarget: 0,
              discount: 0.00,
              orderStatus: 0,
              orderLineRequests: [
                {
                  itemName: 'Welcome Box - Techstarter',
                  articleNumber: '1499',
                  itemNetSale: 0.00,
                  itemVAT: 0.00,
                  quantity: 1,
                  type: 0,
                  discount: 0.00,
                  netPurchasePrice: 0.00
                }
              ],
              shippingAddressRequests: [
                {
                  salutation: 'Mr',
                  firstName: 'Felix',
                  lastName: 'Ixkes',
                  title: '',
                  company: '',
                  companyAddition: '',
                  street: 'Flügelstraße 6',
                  addressAddition: '',
                  zipCode: '40227',
                  place: 'Düsseldorf',
                  phone: '',
                  state: '',
                  country: 'Germany',
                  iso: '',
                  telephone: '',
                  mobile: '',
                  fax: '',
                  email: 'christoph@biglittlethings.de'
                }
              ]
            }
          ]
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.be.equal('Article Welcome Box - Techstarter with Article Number 1499 not found')
    })

    it('Should return 400 Bad Request when a user creates an order with an article that has a high minimum quantity set', async () => {
      const randomPassword = faker.internet.password()
      await createVerifiedUser('mantis105@gotg.com', randomPassword)
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'mantis105@gotg.com', password: randomPassword } })

      const tokenUser = resUser.body.token

      const res = await chai
        .request(app)
        .post('/api/pending-orders')
        .set('Authorization', `Bearer ${String(tokenUser)}`)
        .send({
          pendingOrders: [
            {
              costCenter: '',
              platform: 0,
              language: 0,
              currency: 'EUR',
              orderNo: '0',
              inetorderno: 0,
              shippingId: 21,
              shipped: dayjs.utc().add(1, 'day'),
              deliverydate: dayjs.utc().add(1, 'day'),
              note: '',
              description: ' +',
              paymentType: 0,
              paymentTarget: 0,
              discount: 0.00,
              orderStatus: 0,
              orderLineRequests: [
                {
                  itemName: 'Gußkarte - Duisburger Werkstätten',
                  articleNumber: '110000000000',
                  itemNetSale: 0.00,
                  itemVAT: 0.00,
                  quantity: 1,
                  type: 0,
                  discount: 0.00,
                  netPurchasePrice: 0.00
                }
              ],
              shippingAddressRequests: [
                {
                  salutation: 'Mr',
                  firstName: 'Felix',
                  lastName: 'Ixkes',
                  title: '',
                  company: '',
                  companyAddition: '',
                  street: 'Flügelstraße 6',
                  addressAddition: '',
                  zipCode: '40227',
                  place: 'Düsseldorf',
                  phone: '',
                  state: '',
                  country: 'Germany',
                  iso: '',
                  telephone: '',
                  mobile: '',
                  fax: '',
                  email: 'christoph@biglittlethings.de'
                }
              ]
            }
          ]
        })

      expect(res).to.have.status(400)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.be.equal('Article Gußkarte - Duisburger Werkstätten with Article Number 110000000000 should have a minimum order quantity of 10')
    })

    it('Should return 400 Bad Request when a user creates an order that exceeds maximum limit of graduated prices with an article that has graduated prices and exceed stock is true', async () => {
      const randomPassword = faker.internet.password()
      await createVerifiedUser('mantis106@gotg.com', randomPassword)
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'mantis106@gotg.com', password: randomPassword } })

      const tokenUser = resUser.body.token

      const res = await chai
        .request(app)
        .post('/api/pending-orders')
        .set('Authorization', `Bearer ${String(tokenUser)}`)
        .send({
          pendingOrders: [
            {
              costCenter: '',
              platform: 0,
              language: 0,
              currency: 'EUR',
              orderNo: '0',
              inetorderno: 0,
              shippingId: 21,
              shipped: dayjs.utc().add(1, 'day'),
              deliverydate: dayjs.utc().add(1, 'day'),
              note: '',
              description: ' +',
              paymentType: 0,
              paymentTarget: 0,
              discount: 0.00,
              orderStatus: 0,
              orderLineRequests: [
                {
                  itemName: 'Marmelade Himbeere Pur',
                  articleNumber: '305',
                  itemNetSale: 0.00,
                  itemVAT: 0.00,
                  quantity: 11,
                  type: 0,
                  discount: 0.00,
                  netPurchasePrice: 0.00
                }
              ],
              shippingAddressRequests: [
                {
                  salutation: 'Mr',
                  firstName: 'Felix',
                  lastName: 'Ixkes',
                  title: '',
                  company: '',
                  companyAddition: '',
                  street: 'Flügelstraße 6',
                  addressAddition: '',
                  zipCode: '40227',
                  place: 'Düsseldorf',
                  phone: '',
                  state: '',
                  country: 'Germany',
                  iso: '',
                  telephone: '',
                  mobile: '',
                  fax: '',
                  email: 'christoph@biglittlethings.de'
                }
              ]
            }
          ]
        })

      expect(res).to.have.status(400)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.be.equal('Article Marmelade Himbeere Pur with Article Number 305 should have a maximum order quantity of 10')
    })
  })

  describe('Duplicate pending orders', () => {
    it('Should return 404 Not Found when an admin tries to duplicate pending orders that do not exits.', async () => {
      const res = await chai
        .request(app)
        .post('/api/pending-orders/duplicate')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          postedOrders: [
            {
              orderId: '17064477727948800',
              shipped: dayjs.utc().add(1, 'day')
            },
            {
              orderId: '17064460270206976',
              shipped: dayjs.utc().add(1, 'day')
            }
          ]
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Pending orders not found')
    })

    it('Should return 403 Forbidden when an normal user tries to duplicate pending orders.', async () => {
      const res = await chai
        .request(app)
        .post('/api/pending-orders/duplicate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          postedOrders: [
            {
              orderId: '17064477727948800',
              shipped: dayjs.utc().add(1, 'day')
            },
            {
              orderId: '17064460270206976',
              shipped: dayjs.utc().add(1, 'day')
            }
          ]
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only admin, company admin or campaign manager can perform this action')
    })

    it('Should return 201 Created when an admin user successfully duplicates pending orders.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Pending Orders',
            email: 'test@companymarvelpendingorders.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Pending Orders',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const resPendingOrders = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pendingOrders
        })

      await updatePendingOrderWithPostedOrderId(resPendingOrders.body.pendingOrders[0].id, '20064477727948800')
      await updatePendingOrderWithPostedOrderId(resPendingOrders.body.pendingOrders[1].id, '20064460270206976')

      const res = await chai
        .request(app)
        .post('/api/pending-orders/duplicate')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          postedOrders: [
            {
              orderId: '20064477727948800',
              shipped: dayjs.utc().add(1, 'day')
            },
            {
              orderId: '20064460270206976',
              shipped: dayjs.utc().add(1, 'day')
            }
          ]
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array').of.length(2)
    })

    it('Should return 403 Forbidden when an company admin user tries to duplicate pending orders from different companies.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Pending Orders',
            email: 'test@companymarvelpendingordersforbidden.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Pending Orders',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const resPendingOrders = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pendingOrders
        })

      await updatePendingOrderWithPostedOrderId(resPendingOrders.body.pendingOrders[0].id, '20064477727948800')
      await updatePendingOrderWithPostedOrderId(resPendingOrders.body.pendingOrders[1].id, '20064460270206976')
      const randomPassword = faker.internet.password()

      await createCompanyAdministrator('test@companymarvelpendingorders23.com', randomPassword)
      const resCompanyAdminUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'test@companymarvelpendingorders23.com', password: randomPassword } })

      const tokenCompanyAdmin = resCompanyAdminUser.body.token

      const res = await chai
        .request(app)
        .post('/api/pending-orders/duplicate')
        .set('Authorization', `Bearer ${String(tokenCompanyAdmin)}`)
        .send({
          postedOrders: [
            {
              orderId: '20064477727948800',
              shipped: dayjs.utc().add(1, 'day')
            },
            {
              orderId: '20064460270206976',
              shipped: dayjs.utc().add(1, 'day')
            }
          ]
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('All orders must belong to the same company as the user')
    })
  })

  describe('Update a pending order', () => {
    it('Should return 200 OK when a user update an order', async () => {
      const pendingOrder = await chai
        .request(app)
        .post('/api/pending-orders')
        .set('Authorization', `Bearer ${String(token)}`)
        .send({
          pendingOrders
        })

      const pendingOrderId = String(pendingOrder.body.pendingOrders[0].id)

      const res = await chai
        .request(app)
        .put(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${String(token)}`)
        .send({
          pendingOrders: pendingOrderForUpdate
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrder')
      expect(res.body.pendingOrder).to.be.an('object')
      expect(res.body.pendingOrder.description).to.equal('Updated Description')
    })

    it('Should return 200 OK when admin update an order', async () => {
      const pendingOrder = await chai
        .request(app)
        .post('/api/pending-orders')
        .set('Authorization', `Bearer ${String(token)}`)
        .send({
          pendingOrders
        })

      const pendingOrderId = String(pendingOrder.body.pendingOrders[0].id)

      const res = await chai
        .request(app)
        .put(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${String(tokenAdmin)}`)
        .send({
          pendingOrders: pendingOrderForUpdate
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrder')
      expect(res.body.pendingOrder).to.be.an('object')
      expect(res.body.pendingOrder.description).to.equal('Updated Description')
    })

    it('Should return 200 OK when company admin update an order', async () => {
      const pendingOrder = await chai
        .request(app)
        .post('/api/pending-orders')
        .set('Authorization', `Bearer ${String(token)}`)
        .send({
          pendingOrders
        })

      const pendingOrderId = String(pendingOrder.body.pendingOrders[0].id)

      const res = await chai
        .request(app)
        .put(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${String(tokenCompanyAdministrator)}`)
        .send({
          pendingOrders: pendingOrderForUpdate
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrder')
      expect(res.body.pendingOrder).to.be.an('object')
      expect(res.body.pendingOrder.description).to.equal('Updated Description')
    })

    it('Should return 200 OK when campaign manager update an order', async () => {
      const pendingOrder = await chai
        .request(app)
        .post('/api/pending-orders')
        .set('Authorization', `Bearer ${String(token)}`)
        .send({
          pendingOrders
        })

      const pendingOrderId = String(pendingOrder.body.pendingOrders[0].id)

      const res = await chai
        .request(app)
        .put(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${String(tokenCampaignManager)}`)
        .send({
          pendingOrders: pendingOrderForUpdate
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrder')
      expect(res.body.pendingOrder).to.be.an('object')
      expect(res.body.pendingOrder.description).to.equal('Updated Description')
    })

    it('Should return 403 FORBIDDEN when another user updates an order', async () => {
      const pendingOrder = await chai
        .request(app)
        .post('/api/pending-orders')
        .set('Authorization', `Bearer ${String(tokenCampaignManager)}`)
        .send({
          pendingOrders
        })

      const pendingOrderId = String(pendingOrder.body.pendingOrders[0].id)

      const res = await chai
        .request(app)
        .put(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${String(token)}`)
        .send({
          pendingOrders: pendingOrderForUpdate
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })
  })

  describe('Get a pending order by pending order id', () => {
    let pendingOrderId: string

    beforeEach(async () => {
      const pendingOrder = await chai
        .request(app)
        .post('/api/pending-orders')
        .set('Authorization', `Bearer ${String(token)}`)
        .send({
          pendingOrders
        })

      pendingOrderId = String(pendingOrder.body.pendingOrders[0].id)
    })

    it('Should return 200 Success when an admin successfully retrieves an pending order by ID', async () => {
      const res = await chai
        .request(app)
        .get(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrder')
      expect(res.body.pendingOrder).to.be.an('object')
      expect(res.body.pendingOrder.id).to.equal(pendingOrderId)
    })

    it('Should return 200 Success when a company admin successfully retrieves an pending order by id for their company', async () => {
      const res = await chai
        .request(app)
        .get(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrder')
      expect(res.body.pendingOrder).to.be.an('object')
      expect(res.body.pendingOrder.id).to.equal(pendingOrderId)
    })

    it('Should return 200 Success when a campaign manager successfully retrieves an pending order by id for their campaign', async () => {
      const res = await chai
        .request(app)
        .get(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrder')
      expect(res.body.pendingOrder).to.be.an('object')
      expect(res.body.pendingOrder.id).to.equal(pendingOrderId)
    })

    it('Should return 200 Success when a user successfully retrieves their own pending order by id', async () => {
      const res = await chai
        .request(app)
        .get(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrder')
      expect(res.body.pendingOrder).to.be.an('object')
      expect(res.body.pendingOrder.id).to.equal(pendingOrderId)
    })

    it('Should return 403 Forbidden when a user tries to access an pending order that does not belong to them', async () => {
      const newPendingOrder = await chai
        .request(app)
        .post('/api/pending-orders')
        .set('Authorization', `Bearer ${String(tokenCompanyAdministrator)}`)
        .send({
          pendingOrders
        })

      const newPendingOrderId = String(newPendingOrder.body.pendingOrders[0].id)

      const res = await chai
        .request(app)
        .get(`/api/pending-orders/${newPendingOrderId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })
  })

  describe('Delete Pending Order', () => {
    it('Should return 204 when a admin deletes a pending order.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Pending Orders Two',
            email: 'test@companymarvelpendingorderstwo.com',
            customerId: 123
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const resPendingOrder = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pendingOrders
        })

      const pendingOrderId = String(resPendingOrder.body.pendingOrders[0].id)

      const res = await chai
        .request(app)
        .delete(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 204 when a company admin deletes a pending order.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Pending Orders Three',
            email: 'testpendingorders@starkindustriesmarvel2.com',
            customerId: 373,
            domain: 'starkindustriesmarvel2.com'
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'sharoncarterthree@starkindustriesmarvel2.com',
            actionType: 'add'
          }
        })

      const resCompanyAdmin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'sharoncarterthree@starkindustriesmarvel2.com', password: sharonCarterPassword } })

      const tokenCompanyAdminTwo = resCompanyAdmin.body.token

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const resPendingOrder = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pendingOrders
        })

      const pendingOrderId = String(resPendingOrder.body.pendingOrders[0].id)

      const res = await chai
        .request(app)
        .delete(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${String(tokenCompanyAdminTwo)}`)

      expect(res).to.have.status(204)
    })

    it('Should return 204 when a campaign manager deletes a pending order.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Pending Orders Four',
            email: 'testkreenation@kree.kr',
            customerId: 123,
            domain: 'kree.kr'
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'drminerva@kree.kr',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'drminerva@kree.kr', password: campaignManagerPassword } })

      const tokenCampaignManagerTwo = resCampaignManager.body.token

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const resPendingOrder = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pendingOrders
        })

      const pendingOrderId = String(resPendingOrder.body.pendingOrders[0].id)

      const res = await chai
        .request(app)
        .delete(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${String(tokenCampaignManagerTwo)}`)

      expect(res).to.have.status(204)
    })

    it('Should return 204 when a user deletes a pending order.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Pending Orders Five',
            email: 'test@companymarvelpendingordersfive.com',
            customerId: 123
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const resPendingOrder = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pendingOrders
        })

      const pendingOrderId = String(resPendingOrder.body.pendingOrders[0].id)

      const res = await chai
        .request(app)
        .delete(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when a non-owner-user tries to delete a pending order.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Pending Orders Six',
            email: 'test@companymarvelpendingorderssix.com',
            customerId: 123
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const resPendingOrder = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${String(token)}`)
        .send({
          pendingOrders
        })

      const pendingOrderId = String(resPendingOrder.body.pendingOrders[0].id)

      const res = await chai
        .request(app)
        .delete(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })

    it('Should return 404 when a admin tries to delete a pending order that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/pending-orders/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('PendingOrder not found')
    })

    it('Should return 403 when a admin tries to delete a catalogue pending order.', async () => {
      const resPendingOrder = await chai
        .request(app)
        .post('/api/pending-orders')
        .set('Authorization', `Bearer ${String(tokenCampaignManager)}`)
        .send({
          pendingOrders
        })

      const pendingOrderId = String(resPendingOrder.body.pendingOrders[0].id)

      const res = await chai
        .request(app)
        .delete(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You cannot perform this action for a catalogue pending order')
    })

    it('Should return 403 Forbidden when a admin tries to delete a posted pending order.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Pending Orders Seven',
            email: 'test@companymarvelpendingordersseven.com',
            customerId: 123
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)
      const postedPendingOrder = await createPostedPendingOrder(companyId, userIdAdmin, campaignId)

      const updatedPendingOrderId = String(postedPendingOrder.id)

      const res = await chai
        .request(app)
        .delete(`/api/pending-orders/${updatedPendingOrderId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You cannot perform this action for a posted or queued order')
    })

    it('Should return 403 Forbidden when a admin tries to delete a queued pending order.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Pending Orders Eight',
            email: 'test@companymarvelpendingorderseight.com',
            customerId: 123
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const queuedPendingOrder = await createQueuedPendingOrder(companyId, userIdAdmin, campaignId)

      const updatedPendingOrderId = String(queuedPendingOrder.id)

      const res = await chai
        .request(app)
        .delete(`/api/pending-orders/${updatedPendingOrderId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You cannot perform this action for a posted or queued order')
    })
  })

  describe('Upload a file and create a pending order for GETEC Actions', () => {
    it('Should return 201 Created when an admin successfully creates a pending order with campaign id set.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'GETEC Pending Orders',
            email: 'test@getecpendingorders.com',
            customerId: 123
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)
      process.env.GETEC_CAMPAIGN_ID = campaignId
      const basicAuth = Buffer.from(`${username5}:${password5}`).toString('base64')
      const filePath = path.join(__dirname, '../test.xml')
      const res = await chai
        .request(app)
        .post('/api/pending-orders/upload')
        .set('Authorization', `Basic ${basicAuth}`)
        .set('Content-Type', 'multipart/form-data')
        .attach('file', fs.readFileSync(filePath), 'test.xml')

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array')
    })

    it('Should return 201 Created when an admin successfully creates a pending order without campaign id set.', async () => {
      delete process.env.GETEC_CAMPAIGN_ID
      const basicAuth = Buffer.from(`${username5}:${password5}`).toString('base64')
      const filePath = path.join(__dirname, '../test.xml')
      const res = await chai
        .request(app)
        .post('/api/pending-orders/upload')
        .set('Authorization', `Basic ${basicAuth}`)
        .set('Content-Type', 'multipart/form-data')
        .attach('file', fs.readFileSync(filePath), 'test.xml')

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array')
    })

    it('Should return 400 Bad Request when an admin tries to create pending order with xml file without some items.', async () => {
      const basicAuth = Buffer.from(`${username5}:${password5}`).toString('base64')
      const filePath = path.join(__dirname, '../testWithError.xml')
      const res = await chai
        .request(app)
        .post('/api/pending-orders/upload')
        .set('Authorization', `Basic ${basicAuth}`)
        .set('Content-Type', 'multipart/form-data')
        .attach('file', fs.readFileSync(filePath), 'testWithError.xml')

      expect(res).to.have.status(400)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    })

    it('Should return 400 Bad Request when an admin tries to create pending order with invalid xml file.', async () => {
      const basicAuth = Buffer.from(`${username5}:${password5}`).toString('base64')
      const filePath = path.join(__dirname, '../testError.xml')
      const res = await chai
        .request(app)
        .post('/api/pending-orders/upload')
        .set('Authorization', `Basic ${basicAuth}`)
        .set('Content-Type', 'multipart/form-data')
        .attach('file', fs.readFileSync(filePath), 'testError.xml')

      expect(res).to.have.status(400)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    })

    it('Should return 400 Bad Request when an admin tries to create pending order with invalid file type.', async () => {
      const basicAuth = Buffer.from(`${username5}:${password5}`).toString('base64')
      const filePath = path.join(__dirname, '../bulkPendingOrders.json')
      const res = await chai
        .request(app)
        .post('/api/pending-orders/upload')
        .set('Authorization', `Basic ${basicAuth}`)
        .set('Content-Type', 'multipart/form-data')
        .attach('file', fs.readFileSync(filePath), 'bulkPendingOrders.json')

      expect(res).to.have.status(400)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    })

    it('Should return 400 Bad Request when an admin tries to create pending order with invalid xml schema file.', async () => {
      const basicAuth = Buffer.from(`${username5}:${password5}`).toString('base64')
      const filePath = path.join(__dirname, '../testValidationError.xml')
      const res = await chai
        .request(app)
        .post('/api/pending-orders/upload')
        .set('Authorization', `Basic ${basicAuth}`)
        .set('Content-Type', 'multipart/form-data')
        .attach('file', fs.readFileSync(filePath), 'testValidationError.xml')

      expect(res).to.have.status(400)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    })

    it('should return 401 UNAUTHORIZED when a non-admin tries to upload a file', async () => {
      const res = await chai
        .request(app)
        .post('/api/pending-orders/upload')
        .set('Authorization', `Basic ${Buffer.from('nonadmin:password').toString('base64')}`)
        .attach('file', Buffer.from('test file content'), 'test.txt')

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Invalid Username or Password')
    })

    it('should return 401 UNAUTHORIZED when a admin tries to upload a file with wrong password', async () => {
      const res = await chai
        .request(app)
        .post('/api/pending-orders/upload')
        .set('Authorization', `Basic ${Buffer.from(`${username5}:password`).toString('base64')}`)
        .attach('file', Buffer.from('test file content'), 'test.txt')

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Invalid Username or Password')
    })

    it('should return 401 UNAUTHORIZED when admin tries to upload a file with invalid auth type', async () => {
      const res = await chai
        .request(app)
        .post('/api/pending-orders/upload')
        .set('Authorization', 'Bearer token')
        .attach('file', Buffer.from('test file content'), 'test.txt')

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Invalid Authorization Header')
    })

    it('should return 400 Bad Request when admin tries to upload a file without file', async () => {
      const res = await chai
        .request(app)
        .post('/api/pending-orders/upload')
        .set('Authorization', `Basic ${Buffer.from(`${username5}:${password5}`).toString('base64')}`)

      expect(res).to.have.status(400)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('No files uploaded.')
    })
  })
})
