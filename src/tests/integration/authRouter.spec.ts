import sgMail from '@sendgrid/mail'
import chai from 'chai'
import chaiHttp from 'chai-http'
import { v1 as uuidv1 } from 'uuid'

import app from '../../app'
import generateToken from '../../utils/generateToken'
import {
  deleteTestUser, createBlockedUser,
  createLockedOutUser30mins, createUserWithOtp,
  createLockedOutUser1min,
  createAdminTestUser,
  verifyCompanyDomain
} from '../utils'
import * as userRoles from '../../utils/userRoles'
import { encryptUUID } from '../../utils/encryption'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string

describe('Auth Actions', () => {
  before(async () => {
    await createBlockedUser()
    await createLockedOutUser30mins()
    await createLockedOutUser1min()
    await createUserWithOtp()
    await createAdminTestUser()

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: 'thebiggun' } })

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
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Peter', lastName: 'Quill', email: 'starlord1@guardiansofthegalaxy.com', phone: '254720123456', password: 'footloose' } })

    const res = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'starlord1@guardiansofthegalaxy.com', password: 'footloose' } })

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'token', 'user')
  })

  it('should return 201 Created on successful sign up using company id link', async () => {
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
      .send({ user: { firstName: 'Rocket', lastName: 'Raccoon', email: 'rocketraccoon@guardiansofthegalaxy.com', phone: '254720123456', password: 'friend' } })

    expect(res).to.have.status(201)
    expect(res.body).to.include.keys('statusCode', 'success', 'user')
    expect(res.body.success).to.equal(true)
    expect(res.body.user.role).to.equal(userRoles.EMPLOYEE)
  })

  it('should return 404 Not Found if a user tries to sign up using company id link with a company that does not exists', async () => {
    const companyId = encryptUUID(uuidv1())

    const res = await chai
      .request(app)
      .post('/auth/signup')
      .query({
        companyId
      })
      .send({ user: { firstName: 'Rocket', lastName: 'Raccoon', email: 'rocketraccoon1@guardiansofthegalaxy.com', phone: '254720123456', password: 'friend' } })

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
      .send({ user: { firstName: 'Rocket', lastName: 'Raccoon', email: 'rocketraccoon1@guardiansofthegalaxy.com', phone: '254720123456', password: 'friend' } })

    expect(res).to.have.status(422)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.success).to.equal(false)
    expect(res.body.errors.message).to.equal('Invalid invitation link')
  })

  it('should return 422 Unprocessable entity if a user tries to sign up using an invalid invite link that on decryption is not a guid', async () => {
    const companyId = encryptUUID('123456780123401234012340123456789012')

    const res = await chai
      .request(app)
      .post('/auth/signup')
      .query({
        companyId
      })
      .send({ user: { firstName: 'Rocket', lastName: 'Raccoon', email: 'rocketraccoon1@guardiansofthegalaxy.com', phone: '254720123456', password: 'friend' } })

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
          password: 'footloose'
        }
      })

    expect(res).to.have.status(422)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.success).to.equal(false)
    expect(res.body.errors.message).to.equal('A validation error has occured')
  })

  it('should return 200 on successful logout', async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Mary', lastName: 'Jane', email: 'mj@spiderteam.com', phone: '254720123456', password: 'petertingle' } })

    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'mj@spiderteam.com', password: 'petertingle' } })

    const token = resLogin.body.token

    const res = await chai
      .request(app)
      .patch('/auth/logout')
      .set('Authorization', `Bearer ${String(token)}`)

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'user')
    expect(res.body.user.message).to.equal('You have been logged out')
  })

  it('should return a 401 when a blocked user tries to log in', async () => {
    const res = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'wandamaximoff@avengers.com', password: 'thescarletwitch' } })

    expect(res).to.have.status(401)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('User account has been blocked')
  })

  it('should return a 401 when a user logs in with the wrong password more than 5 times 1 minute ago', async () => {
    const res = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'monicarambeau@swordmarvel.com', password: 'photonrox' } })

    expect(res).to.have.status(401)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('Too many failed attempts, try again in 30 minutes')
  })

  it('should return a 401 when a user logs in with the wrong password more than 5 times 29 minutes ago', async () => {
    const res = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'mariarambeau@swordmarvel.com', password: 'photonrox' } })

    expect(res).to.have.status(401)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('Too many failed attempts, try again in 1 minute')
  })

  it('should return authentication failed when a password is wrong', async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Luke', lastName: 'Cage', email: 'lukecage@alias.com', phone: '254720123456', password: 'stormer' } })

    const res = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'lukecage@alias.com', password: 'breaker' } })

    expect(res).to.have.status(401)
  })

  it('should return 404 when user does not exist', async () => {
    const res = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'lukecaga@alias.com', password: 'breaker' } })

    expect(res).to.have.status(404)
    expect(res.body.errors.message).to.equal('User not found')
  })

  it('should return 422 Unprocessable Entity when username is missing', async () => {
    const res = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { password: 'breaker' } })

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
      .send({ user: { firstName: 'Luke', lastName: 'Cage', email: 'lukecage@alias.com', password: 'hellowhellow', username: '  lukecage' } })

    expect(res).to.have.status(422)
    expect(res.body.errors.details[0].username).to.equal('user.username cannot contain spaces')
  })

  it('should return 200 when a reset link is requested', async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Test', lastName: 'User', email: 'raywiretest@gmail.com', phone: '254720123456', password: 'julien' } })

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
      .send({ user: { firstName: 'Test', lastName: 'User', email: 'raywiretest@gmail.com', phone: '254720123456', password: 'julien' } })

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
      .send({ user: { password: '123456' } })

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
    const resUser = await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Queen', lastName: 'Hippolyta', email: 'qh@themyscira.com', phone: '254720123456', password: 'iamthegreatest' } })

    const token = generateToken(resUser.body.user, 'reset', '1 minute')

    const res = await chai
      .request(app)
      .patch('/auth/reset-password')
      .set('Authorization', `Bearer ${String(token)}`)
      .send({ user: { password: '123456' } })

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'user')
    expect(res.body.user).to.be.an('object')
    expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
  })

  it('should return 401 when a user uses an invalid token to reset password', async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Gwen', lastName: 'Stacy', email: 'gs@spiderteam.com', phone: '254720123456', password: 'petertingle' } })

    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'gs@spiderteam.com', password: 'petertingle' } })

    const token = resLogin.body.token

    const res = await chai
      .request(app)
      .patch('/auth/reset-password')
      .set('Authorization', `Bearer ${String(token)}`)
      .send({ user: { password: '123456' } })

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
})
