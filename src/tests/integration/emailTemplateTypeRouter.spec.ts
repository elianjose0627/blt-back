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

describe('Email Template Type actions', () => {
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
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Get all email template types', () => {
    it('Should return 200 Success when an admin successfully retrieves all email template types.', async () => {
      const res = await chai
        .request(app)
        .get('/api/email-template-types')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'emailTemplateTypes')
      expect(res.body.emailTemplateTypes).to.be.an('array')
      expect(res.body.emailTemplateTypes).to.be.an('array').lengthOf.greaterThan(0)
    })

    it('Should return 200 Success when an admin successfully retrieves all email template types.', async () => {
      await chai
        .request(app)
        .post('/api/email-template-types')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplateType: {
            name: 'Password Reset Test',
            type: 'passwordResetTest',
            description: 'This is an email template type for a user password reset',
            placeholders: ['firstname', 'lastname', 'salutation']
          }
        })

      const res = await chai
        .request(app)
        .get('/api/email-template-types')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'emailTemplateTypes')
      expect(res.body.emailTemplateTypes).to.be.an('array')
      expect(res.body.emailTemplateTypes).to.be.an('array').lengthOf.greaterThan(1)
    })
  })

  describe('Create an email template type', () => {
    it('Should return 201 Created when an admin creates an email template type.', async () => {
      const res = await chai
        .request(app)
        .post('/api/email-template-types')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplateType: {
            name: 'Forgot Password Test',
            type: 'forgotPasswordTest',
            description: 'This is an email template type for a user password reset',
            placeholders: ['firstname', 'lastname', 'salutation']
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'emailTemplateType')
      expect(res.body.emailTemplateType).to.be.an('object')
      expect(res.body.emailTemplateType).to.include.keys('id', 'name', 'type', 'description', 'placeholders', 'createdAt', 'updatedAt')
    })

    it('Should return 400 Bad Request when a user creates the same email template type.', async () => {
      const res = await chai
        .request(app)
        .post('/api/email-template-types')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplateType: {
            name: 'Password Reset Test',
            type: 'passwordResetTest',
            description: 'This is an email template type for a user password reset',
            placeholders: ['firstname', 'lastname', 'salutation']
          }
        })

      expect(res).to.have.status(400)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('name must be unique')
    })
  })

  describe('Get, update and delete an email template type', () => {
    it('Should return 200 OK when an admin gets an email template type by id.', async () => {
      const resEmailTemplate = await chai
        .request(app)
        .post('/api/email-template-types')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplateType: {
            name: 'Email Verification Test',
            type: 'emailVerificationTest',
            description: 'This is an email template type for a user to verify the account',
            placeholders: ['firstname', 'lastname', 'salutation']
          }
        })

      const emailTemplateTypeId = resEmailTemplate.body.emailTemplateType.id

      const res = await chai
        .request(app)
        .get(`/api/email-template-types/${String(emailTemplateTypeId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'emailTemplateType')
      expect(res.body.emailTemplateType).to.be.an('object')
      expect(res.body.emailTemplateType).to.include.keys('id', 'name', 'type', 'description', 'placeholders', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates an email template type by id.', async () => {
      const resEmailTemplate = await chai
        .request(app)
        .post('/api/email-template-types')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplateType: {
            name: 'Request OTP Test',
            type: 'requestOtpTest',
            description: 'This is an email template type for a user to request an otp',
            placeholders: ['firstname', 'lastname', 'salutation']
          }
        })

      const emailTemplateTypeId = resEmailTemplate.body.emailTemplateType.id

      const res = await chai
        .request(app)
        .put(`/api/email-template-types/${String(emailTemplateTypeId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplateType: {
            name: 'Request OTP Updated Test',
            type: 'requestOtpTest',
            description: 'This is an email template type for a user to request an otp',
            placeholders: ['firstname', 'lastname', 'salutation']
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'emailTemplateType')
      expect(res.body.emailTemplateType).to.be.an('object')
      expect(res.body.emailTemplateType).to.include.keys('id', 'name', 'type', 'description', 'placeholders', 'createdAt', 'updatedAt')
      expect(res.body.emailTemplateType.name).to.equal('Request OTP Updated Test')
      expect(res.body.emailTemplateType.type).to.equal('requestOtpTest')
    })

    it('Should return 403 Forbidden when an non-administrator tries to update an email template type by id.', async () => {
      const resEmailTemplate = await chai
        .request(app)
        .post('/api/email-template-types')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplateType: {
            name: 'Request OTP 2 Test',
            type: 'requestOtpTwoTest',
            description: 'This is an email template type for a user to request an otp',
            placeholders: ['firstname', 'lastname', 'salutation']
          }
        })

      const emailTemplateTypeId = resEmailTemplate.body.emailTemplateType.id

      const res = await chai
        .request(app)
        .put(`/api/email-template-types/${String(emailTemplateTypeId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          emailTemplateType: {
            name: 'Request OTP Test',
            type: 'requestOtpTest',
            description: 'This is an email template type for a user to request an otp',
            placeholders: ['firstname', 'lastname', 'salutation']
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 204 when a admin deletes an email template type.', async () => {
      const resEmailTemplateType = await chai
        .request(app)
        .post('/api/email-template-types')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplateType: {
            name: 'Request OTP 3 Test',
            type: 'requestOtpThreeTest',
            description: 'This is an email template type for a user to request an otp',
            placeholders: ['firstname', 'lastname', 'salutation']
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/email-template-types/${String(resEmailTemplateType.body.emailTemplateType.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete an email template type that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/email-template-types/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('EmailTemplateType not found')
    })

    it('Should return 403 Forbidden when an non-administrator tries to delete an email template type by id.', async () => {
      const resEmailTemplate = await chai
        .request(app)
        .post('/api/email-template-types')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplateType: {
            name: 'Request OTP 4 Test',
            type: 'requestOtpFourTest',
            description: 'This is an email template type for a user to request an otp',
            placeholders: ['firstname', 'lastname', 'salutation']
          }
        })

      const emailTemplateTypeId = resEmailTemplate.body.emailTemplateType.id

      const res = await chai
        .request(app)
        .delete(`/api/email-template-types/${String(emailTemplateTypeId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })
})
