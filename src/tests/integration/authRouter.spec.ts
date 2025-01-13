import sgMail from '@sendgrid/mail'
import chai from 'chai'
import chaiHttp from 'chai-http'
import { v1 as uuidv1 } from 'uuid'
import { faker } from '@faker-js/faker'

import app from '../../app'
import generateToken from '../../utils/generateToken'
import {
  deleteTestUser, createBlockedUser,
  createLockedOutUser30mins, createUserWithOtp,
  createLockedOutUser1min,
  createAdminTestUser,
  verifyCompanyDomain,
  createBlockedDomain,
  iversAtKreeDotKrPassword,
  createCompanyAdministrator
} from '../utils'
import * as userRoles from '../../utils/userRoles'
import { encodeString, encryptUUID } from '../../utils/encryption'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let emailTemplateTypes: any[]
const blockedUserPassword = faker.internet.password(15)

describe('Auth Actions', () => {
  before(async () => {
    await createBlockedUser(blockedUserPassword)
    await createLockedOutUser30mins()
    await createLockedOutUser1min()
    await createUserWithOtp()
    await createAdminTestUser()

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: iversAtKreeDotKrPassword } })

    tokenAdmin = resAdmin.body.token
  })
  after(async () => {
    await deleteTestUser('lukecage@alias.com')
    await deleteTestUser('starlord@guardiansofthegalaxy.com')
    await deleteTestUser('raywiretest@gmail.com')
    await deleteTestUser('thenaeternal@celestialmarvel.com')
    sgMail.setApiKey(String(process.env.SENDGRID_API_KEY))
  })

  it('should return a token on successful log in with email and password', async () => {
    const randomPassword = faker.internet.password()
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Peter', lastName: 'Quill', email: 'starlord1@guardiansofthegalaxy.com', phone: '254720123456', password: randomPassword } })

    const res = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'starlord1@guardiansofthegalaxy.com', password: randomPassword } })

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'token', 'user')
  })

  it('should return 201 Created on successful sign up using company invite link', async () => {
    const resCompany = await chai
      .request(app)
      .post('/api/companies')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        company: {
          name: 'Test Company Invited',
          email: 'test@companyinvited.com'
        }
      })

    const companyId = resCompany.body.company.id

    await verifyCompanyDomain(companyId)

    const resInviteLink = await chai
      .request(app)
      .get(`/api/companies/${String(companyId)}/invite-link`)
      .set('Authorization', `Bearer ${tokenAdmin}`)

    const res = await chai
      .request(app)
      .post('/auth/signup')
      .query({
        companyId: resInviteLink.body.company.inviteLink.split('=')[1]
      })
      .send({ user: { firstName: 'Rocket', lastName: 'Raccoon', email: 'rocketraccoon@guardiansofthegalaxy.com', phone: '254720123456', password: faker.internet.password() } })

    expect(res).to.have.status(201)
    expect(res.body).to.include.keys('statusCode', 'success', 'user')
    expect(res.body.success).to.equal(true)
    expect(res.body.user.role).to.equal(userRoles.EMPLOYEE)
  })

  it('should return 201 Created on successful sign up using company invite link for campaign manager', async () => {
    const resCompany = await chai
      .request(app)
      .post('/api/companies')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        company: {
          name: 'Test Company Invited Super',
          email: 'test@companyinvitedsuper.com'
        }
      })

    const companyId = resCompany.body.company.id

    await verifyCompanyDomain(companyId)

    const resInviteLink = await chai
      .request(app)
      .get(`/api/companies/${String(companyId)}/invite-link`)
      .set('Authorization', `Bearer ${tokenAdmin}`)

    const res = await chai
      .request(app)
      .post('/auth/signup')
      .query({
        companyId: resInviteLink.body.company.roles.campaignManager.shortInviteLink.split('=')[1]
      })
      .send({ user: { firstName: 'Rocket', lastName: 'Raccoon', email: 'rocketraccoon@guardiansofthegalaxysuper.com', phone: '254720123456', password: faker.internet.password() } })

    expect(res).to.have.status(201)
    expect(res.body).to.include.keys('statusCode', 'success', 'user')
    expect(res.body.success).to.equal(true)
    expect(res.body.user.role).to.equal(userRoles.CAMPAIGNMANAGER)
  })

  it('should return 201 Created on successful sign up using company invite link for company with company inviteTokens set', async () => {
    const password = faker.internet.password()
    const companyAdmin = await createCompanyAdministrator('test@companyinvitedtokens.com', password)

    const companyId = companyAdmin.companyId

    const resInviteLink = await chai
      .request(app)
      .patch(`/api/companies/${String(companyId)}/invite-link`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        companyInviteToken: {
          roles: [userRoles.CAMPAIGNMANAGER, userRoles.COMPANYADMINISTRATOR, userRoles.EMPLOYEE]
        }
      })

    const res = await chai
      .request(app)
      .post('/auth/signup')
      .query({
        companyId: resInviteLink.body.company.inviteLink.split('=')[1]
      })
      .send({ user: { firstName: 'Rocket', lastName: 'Raccoon', email: 'rocketraccoontwo@guardiansofthegalaxy23.com', phone: '254720123456', password: faker.internet.password() } })

    expect(res).to.have.status(201)
    expect(res.body).to.include.keys('statusCode', 'success', 'user')
    expect(res.body.success).to.equal(true)
    expect(res.body.user.role).to.equal(userRoles.EMPLOYEE)
  })

  it('should return 201 Created on successful sign up using company short invite link', async () => {
    const resCompany = await chai
      .request(app)
      .post('/api/companies')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        company: {
          name: 'Test Company Invited Short Token',
          email: 'test@companyinvitedshorttoken.com'
        }
      })

    const companyId = resCompany.body.company.id

    await verifyCompanyDomain(companyId)

    const resInviteLink = await chai
      .request(app)
      .get(`/api/companies/${String(companyId)}/invite-link`)
      .set('Authorization', `Bearer ${tokenAdmin}`)

    const res = await chai
      .request(app)
      .post('/auth/signup')
      .query({
        companyId: resInviteLink.body.company.shortInviteLink.split('=')[1]
      })
      .send({ user: { firstName: 'Rocket', lastName: 'Raccoon', email: 'rocketraccoontwotwo@guardiansofthegalaxy.com', phone: '254720123456', password: faker.internet.password() } })

    expect(res).to.have.status(201)
    expect(res.body).to.include.keys('statusCode', 'success', 'user')
    expect(res.body.success).to.equal(true)
    expect(res.body.user.role).to.equal(userRoles.EMPLOYEE)
  })

  it('should return 200 OK on successful sign up using company invite link for company with domain checks set', async () => {
    const password = faker.internet.password()
    const companyAdmin = await createCompanyAdministrator('test@companydomaincheck1.com', password)

    const companyId = companyAdmin.companyId

    await chai
      .request(app)
      .patch(`/api/companies/${String(companyId)}/invite-domain-check`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        companyInviteToken: {
          roles: {
            Employee: true,
            CampaignManager: false,
            CompanyAdministrator: false
          }
        }
      })

    const resInviteLink = await chai
      .request(app)
      .get(`/api/companies/${String(companyId)}/invite-link`)
      .set('Authorization', `Bearer ${tokenAdmin}`)

    const res = await chai
      .request(app)
      .post('/auth/signup')
      .query({
        companyId: resInviteLink.body.company.inviteLink.split('=')[1]
      })
      .send({ user: { firstName: 'Rocket', lastName: 'Raccoon', email: 'rocketraccoontwo@companydomaincheck1.com', phone: '254720123456', password: faker.internet.password() } })

    expect(res).to.have.status(201)
    expect(res.body).to.include.keys('statusCode', 'success', 'user')
    expect(res.body.success).to.equal(true)
    expect(res.body.user.role).to.equal(userRoles.EMPLOYEE)
  })

  it('should return 403 Forbidden on sign up using company invite link for company with domain checks set', async () => {
    const password = faker.internet.password()
    const companyAdmin = await createCompanyAdministrator('test@companydomaincheck.com', password)

    const companyId = companyAdmin.companyId

    await chai
      .request(app)
      .patch(`/api/companies/${String(companyId)}/invite-domain-check`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        companyInviteToken: {
          roles: {
            Employee: true,
            CampaignManager: false,
            CompanyAdministrator: false
          }
        }
      })

    const resInviteLink = await chai
      .request(app)
      .get(`/api/companies/${String(companyId)}/invite-link`)
      .set('Authorization', `Bearer ${tokenAdmin}`)

    const res = await chai
      .request(app)
      .post('/auth/signup')
      .query({
        companyId: resInviteLink.body.company.inviteLink.split('=')[1]
      })
      .send({ user: { firstName: 'Rocket', lastName: 'Raccoon', email: 'rocketraccoontwo@guardiansofthegalaxy2323.com', phone: '254720123456', password: faker.internet.password() } })

    expect(res).to.have.status(403)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.success).to.equal(false)
    expect(res.body.errors.message).to.equal('The email domain and the company domains do not match')
  })

  it('should return 404 Not Found if a user tries to sign up using company id link with a company that does not exists', async () => {
    const companyId = uuidv1()
    const encryptedUUID = encryptUUID(companyId, 'base64', companyId)
    const encryptedUUIDWithCompanyIdHex = encodeString(`${encryptedUUID}.${companyId}`, 'hex')

    const res = await chai
      .request(app)
      .post('/auth/signup')
      .query({
        companyId: encryptedUUIDWithCompanyIdHex
      })
      .send({ user: { firstName: 'Rocket', lastName: 'Raccoon', email: 'rocketraccoon1@guardiansofthegalaxy.com', phone: '254720123456', password: faker.internet.password() } })

    expect(res).to.have.status(404)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.success).to.equal(false)
    expect(res.body.errors.message).to.equal('Company not found')
  })

  it('should return 422 Unprocessable entity if a user tries to sign up using an invalid invite link', async () => {
    const companyId = '269cf2ba92f35af3c1c9c96e25d1ae84f01e9b39872707e8190bfa0et634182728d04c362f7e46abf8810051b479ef9a'

    const res = await chai
      .request(app)
      .post('/auth/signup')
      .query({
        companyId
      })
      .send({ user: { firstName: 'Rocket', lastName: 'Raccoon', email: 'rocketraccoon1@guardiansofthegalaxy.com', phone: '254720123456', password: faker.internet.password() } })

    expect(res).to.have.status(422)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.success).to.equal(false)
    expect(res.body.errors.message).to.equal('Invalid invitation link')
  })

  it('should return 422 Unprocessable entity if a user tries to sign up using an invalid invite link that on decryption is not a guid', async () => {
    const companyId = encryptUUID('123456780123401234012340123456789012', 'base64', uuidv1())
    const encodeCompanyIdToHex = encodeString(`${companyId}.${uuidv1()}`, 'hex')

    const res = await chai
      .request(app)
      .post('/auth/signup')
      .query({
        companyId: encodeCompanyIdToHex
      })
      .send({ user: { firstName: 'Rocket', lastName: 'Raccoon', email: 'rocketraccoon1@guardiansofthegalaxy.com', phone: '254720123456', password: faker.internet.password() } })

    expect(res).to.have.status(422)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.success).to.equal(false)
    expect(res.body.errors.message).to.equal('Invalid invitation link')
  })

  it('should return 422 when a user tries to sign up with an empty username', async () => {
    const res = await chai
      .request(app)
      .post('/auth/signup')
      .send({
        user: {
          firstName: 'Peter',
          lastName: 'Quill',
          username: '',
          email: 'starlord1@guardiansofthegalaxy.com',
          phone: '254720123456',
          password: faker.internet.password()
        }
      })

    expect(res).to.have.status(422)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.success).to.equal(false)
    expect(res.body.errors.message).to.equal('A validation error has occurred')
  })

  it('should return 422 when a user tries to sign up with an email domain that is blocked', async () => {
    await createBlockedDomain('t-online.de')
    const res = await chai
      .request(app)
      .post('/auth/signup')
      .send({
        user: {
          firstName: 'Peter',
          lastName: 'Quill',
          username: 'pquill',
          email: 'starlord@t-online.de',
          phone: '254720123456',
          password: faker.internet.password()
        }
      })

    expect(res).to.have.status(422)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.success).to.equal(false)
    expect(res.body.errors.message).to.equal('Kindly register with another email provider, t-online.de is not supported.')
  })

  it('should return 200 on successful logout', async () => {
    const randomPassword = faker.internet.password()
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Mary', lastName: 'Jane', email: 'mj@spiderteam.com', phone: '254720123456', password: randomPassword } })

    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'mj@spiderteam.com', password: randomPassword } })

    const token = resLogin.body.token

    const res = await chai
      .request(app)
      .patch('/auth/logout')
      .set('Authorization', `Bearer ${String(token)}`)

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'user')
    expect(res.body.user.message).to.equal('You have been logged out')
  })

  it('should return 401 on attempting to logout with an expired token', async () => {
    const randomPassword = faker.internet.password()
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Mary', lastName: 'Jane', email: 'mj2@spiderteam.com', phone: '254720123456', password: randomPassword } })

    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'mj2@spiderteam.com', password: randomPassword } })

    const token = resLogin.body.token

    await chai
      .request(app)
      .patch('/auth/logout')
      .set('Authorization', `Bearer ${String(token)}`)

    const res = await chai
      .request(app)
      .patch('/auth/logout')
      .set('Authorization', `Bearer ${String(token)}`)

    expect(res).to.have.status(401)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('token invalid')
  })

  it('should return a 401 when a blocked user tries to log in', async () => {
    const res = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'wandamaximoff@avengers.com', password: blockedUserPassword } })

    expect(res).to.have.status(401)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('User account has been blocked')
  })

  it('should return a 401 when a user logs in with the wrong password more than 5 times 1 minute ago', async () => {
    const res = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'monicarambeau@swordmarvel.com', password: faker.internet.password(6) } })

    expect(res).to.have.status(401)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('Too many failed attempts, try again in 30 minutes')
  })

  it('should return a 401 when a user logs in with the wrong password more than 5 times 29 minutes ago', async () => {
    const res = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'mariarambeau@swordmarvel.com', password: faker.internet.password(6) } })

    expect(res).to.have.status(401)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('Too many failed attempts, try again in 1 minute')
  })

  it('should return authentication failed when a password is wrong', async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Luke', lastName: 'Cage', email: 'lukecage@alias.com', phone: '254720123456', password: faker.internet.password(6) } })

    const res = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'lukecage@alias.com', password: faker.internet.password(8) } })

    expect(res).to.have.status(401)
  })

  it('should return 404 when user does not exist', async () => {
    const res = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'lukecaga@alias.com', password: faker.internet.password() } })

    expect(res).to.have.status(404)
    expect(res.body.errors.message).to.equal('User not found')
  })

  it('should return 422 Unprocessable Entity when username is missing', async () => {
    const res = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { password: faker.internet.password() } })

    expect(res).to.have.status(422)
  })

  it('should return 422 Unprocessable Entity when password is missing', async () => {
    const res = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'lukecage@alias.com' } })

    expect(res).to.have.status(422)
  })

  it('should return 422 Unprocessable Entity when username contains spaces', async () => {
    const res = await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Luke', lastName: 'Cage', email: 'lukecage@alias.com', password: faker.internet.password(), username: '  lukecage' } })

    expect(res).to.have.status(422)
    expect(res.body.errors.details[0].username).to.equal('user.username cannot contain spaces')
  })

  it('should return 200 when a reset link is requested', async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Test', lastName: 'User', email: 'raywiretest@gmail.com', phone: '254720123456', password: faker.internet.password() } })

    const res = await chai
      .request(app)
      .post('/auth/forgot-password')
      .send({ user: { email: 'raywiretest@gmail.com' } })

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'user')
    expect(res.body.user.email).to.equal('raywiretest@gmail.com')
    expect(res.body.user.message).to.equal('A password reset link has been sent to your email')
  })

  it('should return 400 when a reset link email request fails', async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Test', lastName: 'User', email: 'raywiretest@gmail.com', phone: '254720123456', password: faker.internet.password() } })

    sgMail.setApiKey('')

    const res = await chai
      .request(app)
      .post('/auth/forgot-password')
      .send({ user: { email: 'raywiretest@gmail.com' } })

    expect(res).to.have.status(400)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('email was not sent')
  })

  it('should return 404 when a reset link is requested for a user that does not exist', async () => {
    const res = await chai
      .request(app)
      .post('/auth/forgot-password')
      .send({ user: { email: 'doesnotexist@gmail.com' } })

    expect(res).to.have.status(404)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('user not found')
  })

  it('should return 401 when a reset token is missing', async () => {
    const res = await chai
      .request(app)
      .patch('/auth/reset-password')
      .send({ user: { password: faker.internet.password() } })

    expect(res).to.have.status(401)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('No auth token')
  })

  it('should return 422 when a password key is missing', async () => {
    const res = await chai
      .request(app)
      .patch('/auth/reset-password')
      .send({ user: { } })

    expect(res).to.have.status(422)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
  })

  it('should return 200 when the password of a user is successfully reset', async () => {
    const randomPassword = faker.internet.password()
    const resUser = await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Queen', lastName: 'Hippolyta', email: 'qh@themyscira.com', phone: '254720123456', password: randomPassword } })

    const token = generateToken(resUser.body.user, 'reset', '1 minute')

    const res = await chai
      .request(app)
      .patch('/auth/reset-password')
      .set('Authorization', `Bearer ${String(token)}`)
      .send({ user: { password: randomPassword } })

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'user')
    expect(res.body.user).to.be.an('object')
    expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
  })

  it('should return 401 when a user uses an invalid token to reset password', async () => {
    const randomPassword = faker.internet.password()
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Gwen', lastName: 'Stacy', email: 'gs@spiderteam.com', phone: '254720123456', password: randomPassword } })

    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'gs@spiderteam.com', password: randomPassword } })

    const token = resLogin.body.token

    const res = await chai
      .request(app)
      .patch('/auth/reset-password')
      .set('Authorization', `Bearer ${String(token)}`)
      .send({ user: { password: faker.internet.password() } })

    expect(res).to.have.status(401)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('Invalid token')
  })

  it('should return 200 when a user requests an auth token', async () => {
    const res = await chai
      .request(app)
      .post('/auth/token')
      .set('Authorization', `Bearer ${String(tokenAdmin)}`)

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'auth')
  })

  it('should return 200 when a user requests an auth refresh token', async () => {
    const resAuthToken = await chai
      .request(app)
      .post('/auth/token')
      .set('Authorization', `Bearer ${String(tokenAdmin)}`)

    const token = resAuthToken.body.auth.accessToken

    const res = await chai
      .request(app)
      .post('/auth/token/refresh')
      .set('Authorization', `Bearer ${String(tokenAdmin)}`)
      .send({ auth: { token } })

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'auth')
  })

  describe('Email templates for auth', () => {
    before(async () => {
      const resEmailTemplateTypes = await chai
        .request(app)
        .get('/api/email-template-types')
        .set('Authorization', `Bearer ${tokenAdmin}`)
      emailTemplateTypes = resEmailTemplateTypes.body.emailTemplateTypes
    })

    it('Should return 201 Create, on successfully creating a user when a email template exists.', async () => {
      const accountWelcomeEmailTemplateType = emailTemplateTypes.find(emailTemplateType => emailTemplateType.type === 'accountWelcome')
      const accountWelcomeAdminEmailTemplateType = emailTemplateTypes.find(emailTemplateType => emailTemplateType.type === 'accountWelcomeAdmin')
      await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Account Welcome',
            template: 'Hello World, [salutation] [firstname] [lastname], [role], [app], [url], [adminurl], [mailer], [salesmailer], [password]',
            emailTemplateTypeId: accountWelcomeEmailTemplateType.id
          }
        })
      await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Account Welcome Admin',
            template: 'Hello World, [salutation] [firstname] [lastname], [role], [app], [url], [adminurl], [mailer], [salesmailer], [password]',
            emailTemplateTypeId: accountWelcomeAdminEmailTemplateType.id
          }
        })

      const res = await chai
        .request(app)
        .post('/auth/signup')
        .send({
          user: {
            firstName: 'Warriors',
            lastName: 'Three',
            email: 'warthree@asgardtemplateauth.com',
            phone: '254720123456',
            password: faker.internet.password()
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
    })

    it('should return 200 when a reset link is requested when a template exists.', async () => {
      sgMail.setApiKey(String(process.env.SENDGRID_API_KEY))
      const forgotPasswordEmailTemplateType = emailTemplateTypes.find(emailTemplateType => emailTemplateType.type === 'forgotPassword')
      await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Forgot Password',
            template: 'Hello World, [salutation] [firstname] [lastname], [role], [app], [url], [adminurl], [mailer], [salesmailer], [password]',
            emailTemplateTypeId: forgotPasswordEmailTemplateType.id
          }
        })

      const res = await chai
        .request(app)
        .post('/auth/forgot-password')
        .send({ user: { email: 'raywiretest@gmail.com' } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user.email).to.equal('raywiretest@gmail.com')
      expect(res.body.user.message).to.equal('A password reset link has been sent to your email')
    })
  })
})
