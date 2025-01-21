import chai from 'chai'
import chaiHttp from 'chai-http'
import dayjs from 'dayjs'
import app from '../../app'
import { faker } from '@faker-js/faker'
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
  postedPendingOrder,
  queuedPendingOrder
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string
let tokenCompanyAdministrator: string
let tokenCampaignManager: string

const email1 = 'gues@modo.com'
const password1 = faker.internet.password()
const email2 = 'guses@yahoo.com'
const password2 = faker.internet.password()
const email3 = 'faker.internet@google.com'
const password3 = faker.internet.password()
const email4 = 'guesmia@getec.com'
const password4 = faker.internet.password()

describe('Pending Orders actions', () => {
  before(async () => {
    await createAdminTestUser(email1, password1)
    await createCompanyAdministrator(email2, password2)
    await createProduct()
    await createProductWithMinimumOrderQuantity()
    await createProductWithGraduatedPricesAndIsExceedStockEnabledIsTrue()
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

    // create comapaign manager
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
  })

  after(async () => {
    await deleteTestUser(email1)
    await deleteTestUser(email2)
    await deleteTestUser(email3)
    await deleteTestUser(email4)
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

    it('Should return 403 FOBBIDDEN when another user update an order', async () => {
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
        .delete(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 204 when a campany admin deletes a pending order.', async () => {
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
        .delete(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(204)
    })

    it('Should return 204 when a campaign manager deletes a pending order.', async () => {
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
        .delete(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(204)
    })

    it('Should return 204 when a user deletes a pending order.', async () => {
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
        .delete(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when a non-owner-user tries to delete a pending order.', async () => {
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
        .delete(`/api/pending-orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${token}`)

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

    it('Should return 403 Forbidden when a admin tries to delete a posted pending order.', async () => {
      const pendingOrder = await chai
        .request(app)
        .post('/api/pending-orders')
        .set('Authorization', `Bearer ${String(token)}`)
        .send({
          pendingOrders
        })

      const pendingOrderId = String(pendingOrder.body.pendingOrders[0].id)

      const updatedPendingOrder = await chai
        .request(app)
        .put(`/api/pending-orders/${String(pendingOrderId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          pendingOrders: postedPendingOrder
        })

      const updatedPendingOrderId = String(updatedPendingOrder.body.pendingOrder.id)

      const res = await chai
        .request(app)
        .delete(`/api/pending-orders/${updatedPendingOrderId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You can not perform this action for the posted or queued order')
    })

    it('Should return 403 Forbidden when a admin tries to delete a queued pending order.', async () => {
      const pendingOrder = await chai
        .request(app)
        .post('/api/pending-orders')
        .set('Authorization', `Bearer ${String(token)}`)
        .send({
          pendingOrders
        })

      const pendingOrderId = String(pendingOrder.body.pendingOrders[0].id)

      const updatedPendingOrder = await chai
        .request(app)
        .put(`/api/pending-orders/${String(pendingOrderId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          pendingOrders: queuedPendingOrder
        })

      const updatedPendingOrderId = String(updatedPendingOrder.body.pendingOrder.id)

      const res = await chai
        .request(app)
        .delete(`/api/pending-orders/${updatedPendingOrderId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You can not perform this action for the posted or queued order')
    })
  })
})
