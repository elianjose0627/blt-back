import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  createEmailTemplateType
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string
let emailTemplateTypeId: string

describe('Email Template actions', () => {
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

    emailTemplateTypeId = await createEmailTemplateType()

    tokenAdmin = resAdmin.body.token
    token = resUser.body.token
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Get all email templates', () => {
    it('Should return 200 Success when an admin successfully retrieves all email templates.', async () => {
      const res = await chai
        .request(app)
        .get('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'emailTemplates')
      expect(res.body.emailTemplates).to.be.an('array')
      expect(res.body.emailTemplates).to.be.an('array').lengthOf(0)
    })

    it('Should return 200 Success when an admin successfully retrieves all email templates.', async () => {
      await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Password Reset',
            template: 'Hello World',
            emailTemplateTypeId
          }
        })

      const res = await chai
        .request(app)
        .get('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'emailTemplates')
      expect(res.body.emailTemplates).to.be.an('array')
      expect(res.body.emailTemplates).to.be.an('array').lengthOf(1)
    })

    it('Should return 403 Forbidden when a non-admin retrieves all email templates.', async () => {
      const res = await chai
        .request(app)
        .get('/api/email-templates')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })

  describe('Create an email template', () => {
    it('Should return 201 Created when an admin creates an email template.', async () => {
      const templateTypeId = await createEmailTemplateType('userCreation')
      const res = await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Password Reset',
            template: 'Hello World',
            emailTemplateTypeId: templateTypeId
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'emailTemplate')
      expect(res.body.emailTemplate).to.be.an('object')
      expect(res.body.emailTemplate).to.include.keys('id', 'subject', 'template', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a user creates the same email template.', async () => {
      const res = await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Password Reset',
            template: 'Hello World',
            emailTemplateTypeId
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'emailTemplate')
      expect(res.body.emailTemplate).to.be.an('object')
      expect(res.body.emailTemplate).to.include.keys('id', 'subject', 'template', 'createdAt', 'updatedAt')
    })

    it('Should return 404 Not Found when an admin creates an email template with a non-existent email template type.', async () => {
      const res = await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Password Reset',
            template: 'Hello World',
            emailTemplateTypeId: '88D48647-ED1C-49CF-9D53-403D7DAD8DB7'
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Email Template Type not found')
    })
  })

  describe('Get, update and delete an email template', () => {
    it('Should return 200 OK when an owner gets an email template by id.', async () => {
      const resEmailTemplate = await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Password Reset',
            template: 'Hello World',
            emailTemplateTypeId
          }
        })

      const emailTemplateId = resEmailTemplate.body.emailTemplate.id

      const res = await chai
        .request(app)
        .get(`/api/email-templates/${String(emailTemplateId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'emailTemplate')
      expect(res.body.emailTemplate).to.be.an('object')
      expect(res.body.emailTemplate).to.include.keys('id', 'subject', 'template', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator gets an email template by id.', async () => {
      const resEmailTemplate = await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Password Reset',
            template: 'Hello World',
            emailTemplateTypeId
          }
        })

      const emailTemplateId = resEmailTemplate.body.emailTemplate.id

      const res = await chai
        .request(app)
        .get(`/api/email-templates/${String(emailTemplateId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'emailTemplate')
      expect(res.body.emailTemplate).to.be.an('object')
      expect(res.body.emailTemplate).to.include.keys('id', 'subject', 'template', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates an email template by id.', async () => {
      const resEmailTemplate = await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Password Reset',
            template: 'Hello World',
            emailTemplateTypeId
          }
        })

      const emailTemplateId = resEmailTemplate.body.emailTemplate.id

      const res = await chai
        .request(app)
        .put(`/api/email-templates/${String(emailTemplateId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Password Reset',
            template: '<p>Hello World</p>',
            emailTemplateTypeId
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'emailTemplate')
      expect(res.body.emailTemplate).to.be.an('object')
      expect(res.body.emailTemplate).to.include.keys('id', 'subject', 'template', 'createdAt', 'updatedAt')
      expect(res.body.emailTemplate.template).to.equal('<p>Hello World</p>')
    })

    it('Should return 403 Forbidden when an non-administrator tries to update an email template by id.', async () => {
      const resEmailTemplate = await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Password Reset',
            template: 'Hello World',
            emailTemplateTypeId
          }
        })

      const emailTemplateId = resEmailTemplate.body.emailTemplate.id

      const res = await chai
        .request(app)
        .put(`/api/email-templates/${String(emailTemplateId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          emailTemplate: {
            subject: 'Password Reset',
            template: 'Hello World Updated',
            emailTemplateTypeId
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 204 when a admin deletes an email template.', async () => {
      const resEmailTemplate = await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Password Reset',
            template: 'Hello World',
            emailTemplateTypeId
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/email-templates/${String(resEmailTemplate.body.emailTemplate.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete an email template that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/email-templates/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('EmailTemplate not found')
    })

    it('Should return 403 Forbidden when an non-administrator tries to delete an email template by id.', async () => {
      const resEmailTemplate = await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Password Reset',
            template: 'Hello World',
            emailTemplateTypeId
          }
        })

      const emailTemplateId = resEmailTemplate.body.emailTemplate.id

      const res = await chai
        .request(app)
        .delete(`/api/email-templates/${String(emailTemplateId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })
})
