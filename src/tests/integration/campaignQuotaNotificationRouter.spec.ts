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
  happyHoganPassword
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let token: string
let tokenAdmin: string
let tokenAdminTwo: string
let tokenCampaignManager: string
let userIdAdmin: string

describe('Campaign Quota Notification actions', () => {
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

    const resCampaignManager = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

    token = res1.body.token
    tokenAdmin = resAdmin.body.token
    tokenAdminTwo = resAdminTwo.body.token
    tokenCampaignManager = resCampaignManager.body.token
    userIdAdmin = resAdmin.body.user.id
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Delete a campaign quota notification by id', () => {
    it('Should return 204 No Content when an admin successfully deletes a quota notification.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Campaign Quota Notification',
            email: 'ivers@kree.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const resCampaignQuotaNotification = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/quota-notifications`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignQuotaNotification: {
            threshold: 2,
            recipients: [faker.internet.email(), faker.internet.email()]
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-quota-notifications/${String(resCampaignQuotaNotification.body.campaignQuotaNotification.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when a campaign manager tries to delete a quota notification.', async () => {
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

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const resCampaignQuotaNotification = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/quota-notifications`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignQuotaNotification: {
            threshold: 2,
            recipients: [faker.internet.email(), faker.internet.email()]
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-quota-notifications/${String(resCampaignQuotaNotification.body.campaignQuotaNotification.id)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })

    it('Should return 403 Forbidden when a user tries to delete a quota notification.', async () => {
      const resCompany = await createVerifiedCompany(userIdAdmin)

      const companyId = resCompany.id

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const resCampaignQuotaNotification = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/quota-notifications`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignQuotaNotification: {
            threshold: 23,
            recipients: [faker.internet.email(), faker.internet.email()]
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-quota-notifications/${String(resCampaignQuotaNotification.body.campaignQuotaNotification.id)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, admin or employee can perform this action')
    })
  })

  describe('Update a campaign quota notification by id', () => {
    it('Should return 200 OK when an admin successfully updates a quota notification.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Campaign Quota',
            email: 'ivers@kree.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const resCampaignQuotaNotification = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/quota-notifications`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignQuotaNotification: {
            threshold: 2,
            recipients: [faker.internet.email(), faker.internet.email()]
          }
        })

      const recipients = [faker.internet.email(), faker.internet.email()]

      const res = await chai
        .request(app)
        .put(`/api/campaign-quota-notifications/${String(resCampaignQuotaNotification.body.campaignQuotaNotification.id)}`)
        .set('Authorization', `Bearer ${tokenAdminTwo}`)
        .send({
          campaignQuotaNotification: {
            threshold: 2,
            recipients
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaignQuotaNotification')
      expect(res.body.campaignQuotaNotification.threshold).to.equal(2)
      expect(res.body.campaignQuotaNotification.recipients).to.deep.equal(recipients)
      expect(res.body.campaignQuotaNotification.frequency).to.equal(1)
      expect(res.body.campaignQuotaNotification.frequencyUnit).to.equal('month')
      expect(res.body.campaignQuotaNotification.lastSentAt).to.equal(null)
    })
  })
})
