import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import { faker } from '@faker-js/faker'
import {
  deleteTestUser, createAdminTestUser,
  createCompanyAdministrator, createCampaignManager,
  createVerifiedCompany, verifyUser, verifyCompanyDomain, removeCompanyOwnerId, createVerifiedUser,
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

describe('Campaign Address actions', () => {
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

  describe('Delete a campaign address by id', () => {
    it('Should return 204 No Content when an admin successfully deletes a campaign address.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Campaign Address',
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

      const resCampaignAddress = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/addresses`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignAddresses: [{
            country: 'Germany',
            city: 'Berlin',
            type: 'billing'
          }]
        })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-addresses/${String(resCampaignAddress.body.campaignAddresses[0].id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 204 No Content when a campaign manager successfully deletes a campaign address.', async () => {
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

      const resCampaignAddress = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/addresses`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignAddresses: [{
            country: 'Germany',
            city: 'Berlin',
            type: 'billing'
          }]
        })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-addresses/${String(resCampaignAddress.body.campaignAddresses[0].id)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(204)
    })

    it('Should return 204 No Content when a company admin successfully deletes a campaign address.', async () => {
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

      const resCampaignAddress = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/addresses`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignAddresses: [{
            country: 'Germany',
            city: 'Berlin',
            type: 'billing'
          }]
        })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-addresses/${String(resCampaignAddress.body.campaignAddresses[0].id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when a company admin who is not an employee tries to delete a campaign address.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Campaign Address 234',
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

      const resCampaignAddress = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/addresses`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignAddresses: [{
            country: 'Germany',
            city: 'Berlin',
            type: 'billing'
          }]
        })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-addresses/${String(resCampaignAddress.body.campaignAddresses[0].id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, employee or admin can perform this action')
    })

    it('Should return 403 Forbidden when a user who is not an employee tries to delete a campaign address.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Campaign Address 12345',
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

      const resCampaignAddress = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/addresses`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignAddresses: [{
            country: 'Germany',
            city: 'Berlin',
            type: 'billing'
          }]
        })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-addresses/${String(resCampaignAddress.body.campaignAddresses[0].id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, employee or admin can perform this action')
    })

    it('Should return 403 Forbidden when a company non owner tries to delete a campaign address', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Campaign Address 102',
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

      const resCampaignAddress = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/addresses`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignAddresses: [{
            country: 'Germany',
            city: 'Berlin',
            type: 'billing'
          }]
        })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-addresses/${String(resCampaignAddress.body.campaignAddresses[0].id)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, employee or admin can perform this action')
    })

    it('Should return 403 Forbidden when a user tries to delete a campaign address for a company without an owner', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Campaign Address 222',
            email: 'ivers@kree.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      // delete company owner
      await removeCompanyOwnerId(String(resCompany.body.company.id))

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

      const resCampaignAddress = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/addresses`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignAddresses: [{
            country: 'Germany',
            city: 'Berlin',
            type: 'billing'
          }]
        })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-addresses/${String(resCampaignAddress.body.campaignAddresses[0].id)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, employee or admin can perform this action')
    })

    it('Should return 403 Forbidden when an employee of another company tries to delete a campaign address', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Campaign Address Normal',
            email: 'ivers@kree.kr'
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(companyId)

      const resCompanyTwo = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Campaign Address Normal',
            email: 'ivers@kree.kr'
          }
        })

      const companyIdTwo = String(resCompanyTwo.body.company.id)

      await verifyCompanyDomain(companyIdTwo)

      const resCampaignTwo = await chai
        .request(app)
        .post(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const resCampaignAddress = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaignTwo.body.campaign.id)}/addresses`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignAddresses: [{
            country: 'Germany',
            city: 'Berlin',
            type: 'billing'
          }]
        })

      const randomPassword = faker.internet.password()
      await createVerifiedUser('divers@kree.kr', randomPassword)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'divers@kree.kr',
            actionType: 'add'
          }
        })

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'divers@kree.kr', password: randomPassword } })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-addresses/${String(resCampaignAddress.body.campaignAddresses[0].id)}`)
        .set('Authorization', `Bearer ${String(resUser.body.token)}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, employee or admin can perform this action')
    })
  })
})
