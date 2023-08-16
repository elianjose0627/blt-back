import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser, createAdminTestUser,
  createCompanyAdministrator, createCampaignManager,
  createVerifiedCompany, verifyUser, verifyCompanyDomain
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let tokenCompanyAdministrator: string
let tokenCampaignManager: string
let token: string
let userIdAdmin: string

describe('Card Template actions', () => {
  before(async () => {
    await createAdminTestUser()
    await createCompanyAdministrator()
    await createCampaignManager()

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

    const resCampaignManager = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: 'pepperpotts' } })

    const resCompanyAdministrator = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

    tokenAdmin = resAdmin.body.token
    tokenCompanyAdministrator = resCompanyAdministrator.body.token
    tokenCampaignManager = resCampaignManager.body.token
    token = resUser.body.token
    userIdAdmin = resAdmin.body.user.id
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Get a card template by id', () => {
    it('Should return 200 OK when a company owner successfully gets a card template.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Card Template',
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

      const resCardTemplate = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/card-templates`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          cardTemplate: {
            name: null,
            description: null,
            front: null,
            back: null
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/card-templates/${String(resCardTemplate.body.cardTemplate.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'cardTemplate')
      expect(res.body.cardTemplate).to.be.an('object')
      expect(res.body.cardTemplate).to.include.keys('id', 'name', 'description', 'front', 'back', 'isDraft', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a company admin successfully gets a card template.', async () => {
      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()

      const resCompany = await createVerifiedCompany(userIdAdmin)

      const companyId = resCompany.id

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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

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

      const resCardTemplate = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/card-templates`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          cardTemplate: {
            name: null,
            description: null,
            front: null,
            back: null
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/card-templates/${String(resCardTemplate.body.cardTemplate.id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'cardTemplate')
      expect(res.body.cardTemplate).to.be.an('object')
      expect(res.body.cardTemplate).to.include.keys('id', 'name', 'description', 'front', 'back', 'isDraft', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a campaign manager successfully gets a card template.', async () => {
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
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: 'pepperpotts' } })

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

      const resCardTemplate = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/card-templates`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          cardTemplate: {
            name: null,
            description: null,
            front: null,
            back: null
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/card-templates/${String(resCardTemplate.body.cardTemplate.id)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'cardTemplate')
      expect(res.body.cardTemplate).to.be.an('object')
      expect(res.body.cardTemplate).to.include.keys('id', 'name', 'description', 'front', 'back', 'isDraft', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a company admin who is not an employee tries to get a card template.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Card Template',
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

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

      const resCardTemplate = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/card-templates`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          cardTemplate: {
            name: null,
            description: null,
            front: null,
            back: null
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/card-templates/${String(resCardTemplate.body.cardTemplate.id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, admin and employee can perform this action')
    })

    it('Should return 403 Forbidden when a user who is not an employee tries to get a card template.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Card Template',
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
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: 'pepperpotts' } })

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

      const resCardTemplate = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/card-templates`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          cardTemplate: {
            name: null,
            description: null,
            front: null,
            back: null
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/card-templates/${String(resCardTemplate.body.cardTemplate.id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, admin and employee can perform this action')
    })

    it('Should return 403 Forbidden when a company non owner tries to get a card template.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Card Template 2',
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

      const resCardTemplate = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/card-templates`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          cardTemplate: {
            name: null,
            description: null,
            front: null,
            back: null
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/card-templates/${String(resCardTemplate.body.cardTemplate.id)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, admin and employee can perform this action')
    })

    it('Should return 403 Forbidden when a user who is an employee without permisions tries to get a card template.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Card Template',
            email: 'ivers@kree.kr',
            domain: 'kree.kr'
          }
        })

      const companyId = resCompany.body.company.id
      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Mar', lastName: 'Vell', email: 'marvell@kree.kr', phone: '254720123456', password: 'thecolourblue' } })

      await verifyUser('marvell@kree.kr')

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'marvell@kree.kr',
            actionType: 'add'
          }
        })

      const resNewUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'marvell@kree.kr', password: 'thecolourblue' } })

      const tokenNewUser = resNewUser.body.token

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

      const resCardTemplate = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/card-templates`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          cardTemplate: {
            name: null,
            description: null,
            front: null,
            back: null
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/card-templates/${String(resCardTemplate.body.cardTemplate.id)}`)
        .set('Authorization', `Bearer ${String(tokenNewUser)}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })
  })
})
