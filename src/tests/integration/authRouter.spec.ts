import sgMail from '@sendgrid/mail'
import chai from 'chai'
import chaiHttp from 'chai-http'

import app from '../../app'
import {
  deleteTestUser, createBlockedUser,
  createLockedOutUser30mins, createUserWithOtp,
  createLockedOutUser1min
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

describe('Auth Actions', () => {
  before(async () => {
    await createBlockedUser()
    await createLockedOutUser30mins()
    await createLockedOutUser1min()
    await createUserWithOtp()
  })
  after(async () => {
    await deleteTestUser('lukecage@alias.com')
    await deleteTestUser('starlord@guardiansofthegalaxy.com')
    await deleteTestUser('raywiretest@gmail.com')
    await deleteTestUser('thenaeternal@celestial.com')
    sgMail.setApiKey(String(process.env.SENDGRID_API_KEY))
  })

  it('should return a token on successful log in with email and password', async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Peter', lastName: 'Quill', email: 'starlord1@guardiansofthegalaxy.com', phone: '254724374281', password: 'footloose' } })

    const res = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'starlord1@guardiansofthegalaxy.com', password: 'footloose' } })

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'token', 'user')
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
          phone: '254724374281',
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
      .send({ user: { firstName: 'Mary', lastName: 'Jane', email: 'mj@spiderteam.com', phone: '254724374281', password: 'petertingle' } })

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
      .send({ user: { email: 'monicarambeau@sword.com', password: 'photonrox' } })

    expect(res).to.have.status(401)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('Too many failed attempts, try again in 30 minutes')
  })

  it('should return a 401 when a user logs in with the wrong password more than 5 times 29 minutes ago', async () => {
    const res = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'mariarambeau@sword.com', password: 'photonrox' } })

    expect(res).to.have.status(401)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('Too many failed attempts, try again in 1 minute')
  })

  it('should return authentication failed when a password is wrong', async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Luke', lastName: 'Cage', email: 'lukecage@alias.com', phone: '254724374281', password: 'stormer' } })

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

  it('should return 200 when a reset code is requested', async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Test', lastName: 'User', email: 'raywiretest@gmail.com', phone: '254724374281', password: 'julien' } })

    const res = await chai
      .request(app)
      .post('/auth/forgot-password')
      .send({ user: { email: 'raywiretest@gmail.com' } })

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'user')
    expect(res.body.user.email).to.equal('raywiretest@gmail.com')
    expect(res.body.user.message).to.equal('A password reset code has been sent to your email')
  })

  it('should return 400 when a reset code email request fails', async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Test', lastName: 'User', email: 'raywiretest@gmail.com', phone: '254724374281', password: 'julien' } })

    sgMail.setApiKey('')

    const res = await chai
      .request(app)
      .post('/auth/forgot-password')
      .send({ user: { email: 'raywiretest@gmail.com' } })

    expect(res).to.have.status(400)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('email was not sent')
  })

  it('should return 404 when a reset code is requested for a user that does not exist', async () => {
    const res = await chai
      .request(app)
      .post('/auth/forgot-password')
      .send({ user: { email: 'doesnotexist@gmail.com' } })

    expect(res).to.have.status(404)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('user not found')
  })

  it('should return 422 when a otp is missing', async () => {
    const res = await chai
      .request(app)
      .patch('/auth/reset-password')
      .send({ user: { password: '123456' } })

    expect(res).to.have.status(422)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
  })

  it('should return 200 when the password of a user is successfully reset', async () => {
    const res = await chai
      .request(app)
      .patch('/auth/reset-password')
      .send({ user: { email: 'thenaeternal@celestial.com', password: '123456', otp: 123456 } })

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'user')
    expect(res.body.user).to.be.an('object')
    expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
  })

  it('should return 200 when the password of a user is successfully reset and otp expiration in not set in env variable', async () => {
    process.env.OTP_EXPIRATION = ''
    const res = await chai
      .request(app)
      .patch('/auth/reset-password')
      .send({ user: { email: 'thenaeternal@celestial.com', password: '123456', otp: 123456 } })

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'user')
    expect(res.body.user).to.be.an('object')
    expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
  })

  it('should return 401 when a user uses an invalid OTP to reset password', async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Gwen', lastName: 'Stacy', email: 'gs@spiderteam.com', phone: '254724374281', password: 'petertingle' } })

    const res = await chai
      .request(app)
      .patch('/auth/reset-password')
      .send({ user: { password: '123456', email: 'gs@spiderteam.com', otp: 12345 } })

    expect(res).to.have.status(401)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('OTP is invalid')
  })
})
