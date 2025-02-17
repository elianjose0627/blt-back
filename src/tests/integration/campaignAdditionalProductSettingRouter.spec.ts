import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser, createAdminTestUser,
  createCompanyAdministrator, createCampaignManager,
  createVerifiedCompany, verifyUser, verifyCompanyDomain,
  iversAtKreeDotKrPassword,
  nickFuryPassword,
  sheHulkAtStarkIndustriesPassword,
  happyHoganPassword
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let tokenCompanyAdministrator: string
let tokenCampaignManager: string
let token: string
let userIdAdmin: string

describe('Campaign Additional Product Setting actions', () => {
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

    tokenAdmin = resAdmin.body.token
    tokenCompanyAdministrator = resCompanyAdministrator.body.token
    tokenCampaignManager = resCampaignManager.body.token
    token = resUser.body.token
    userIdAdmin = resAdmin.body.user.id
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Delete a campaign additional product setting by id', () => {
    it('Should return 204 No Content when an admin successfully deletes an additional product setting.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Campaign Additional Product Setting',
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

      const resAdditionalProductSetting = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/additional-product-settings`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignAdditionalProductSetting: {
            isSelectEnabled: true,
            role: 'CampaignManager'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-additional-product-settings/${String(resAdditionalProductSetting.body.campaignAdditionalProductSetting.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 204 No Content when a campaign manager successfully deletes an additional product setting.', async () => {
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

      const resAdditionalProductSetting = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/additional-product-settings`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignAdditionalProductSetting: {
            isSelectEnabled: true,
            role: 'CampaignManager'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-additional-product-settings/${String(resAdditionalProductSetting.body.campaignAdditionalProductSetting.id)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when a company admin who is not an employee tries to delete an additional product setting.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Additional Product Setting 234',
            email: 'ivers@kree.kr'
          }
        })

      const companyId = resCompany.body.company.id
      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

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

      const resAdditionalProductSetting = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/additional-product-settings`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignAdditionalProductSetting: {
            isSelectEnabled: true,
            role: 'CampaignManager'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-additional-product-settings/${String(resAdditionalProductSetting.body.campaignAdditionalProductSetting.id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, employee or admin can perform this action')
    })

    it('Should return 403 Forbidden when a user who is not an employee tries to delete an additional product setting.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Additional Product Setting 12345',
            email: 'ivers@kree.kr'
          }
        })

      const companyId = resCompany.body.company.id
      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      await deleteTestUser('happyhogan@starkindustriesmarvel.com')
      await createCampaignManager()

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

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

      const resAdditionalProductSetting = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/additional-product-settings`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignAdditionalProductSetting: {
            isSelectEnabled: true,
            role: 'CampaignManager'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-additional-product-settings/${String(resAdditionalProductSetting.body.campaignAdditionalProductSetting.id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, employee or admin can perform this action')
    })

    it('Should return 403 Forbidden when a company non owner tries to delete an additional product setting', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Additional Product Setting 102',
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

      const resAdditionalProductSetting = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/additional-product-settings`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignAdditionalProductSetting: {
            isSelectEnabled: true,
            role: 'CampaignManager'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-additional-product-settings/${String(resAdditionalProductSetting.body.campaignAdditionalProductSetting.id)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, employee or admin can perform this action')
    })
  })
})
