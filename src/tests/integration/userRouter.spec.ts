import sgMail from '@sendgrid/mail'
import chai from 'chai'
import chaiHttp from 'chai-http'
import { faker } from '@faker-js/faker'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  createUserWithOtp,
  createUserWithExpiredOtp
} from '../utils'
import * as userRoles from '../../utils/userRoles'

const { expect } = chai

chai.use(chaiHttp)

let token: string
let userId: string
let tokenAdmin: string
let userIdAdmin: string

describe('A user', () => {
  before(async () => {
    await createAdminTestUser()
    await createUserWithOtp()
    await createUserWithExpiredOtp()
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Luke', lastName: 'Cage', email: 'ironman@starkindustries.com', phone: '254724374281', password: 'mackone' } })

    const res1 = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ironman@starkindustries.com', password: 'mackone' } })

    const res2 = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: 'thebiggun' } })

    token = res1.body.token
    userId = res1.body.user.id

    tokenAdmin = res2.body.token
    userIdAdmin = res2.body.user.id
  })

  after(async () => {
    await deleteTestUser('ironman@starkindustries.com')
    await deleteTestUser('ivers@kree.kr')
    await deleteTestUser('thenaeternal@celestial.com')
    await deleteTestUser('sersieternal@celestial.com')
    sgMail.setApiKey(String(process.env.SENDGRID_API_KEY))
  })

  describe('Get users', () => {
    it('Should return 200 Success, on successfully retrieving users.', async () => {
      const res = await chai
        .request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'meta', 'users')
      expect(res.body.users).to.be.an('array')
    })
  })

  describe('Search a user by email', () => {
    it('Should return 200 Success, on successfully retrieving users.', async () => {
      const res = await chai
        .request(app)
        .get('/api/users?email=ironman@starkindustries.com')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'meta', 'users')
      expect(res.body.users).to.be.an('array')
    })
  })

  describe('Get a user', () => {
    it('Should return 200 Success, on successfully retrieving a user by id.', async () => {
      const res = await chai
        .request(app)
        .get(`/api/users/${userIdAdmin}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
    })
  })

  describe('Update user profile by id', () => {
    it('Should return 200 when a user updates their username.', async () => {
      const username = faker.internet.userName()
      const res = await chai
        .request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { username } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user.username).to.equal((username).toLowerCase())
    })

    it('Should return 200 when a user updates their username with null.', async () => {
      const res = await chai
        .request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { username: null } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user.username).to.equal(null)
    })

    it('Should return 400 when a user updates their username with one that is already taken.', async () => {
      const username = faker.internet.userName()
      await chai
        .request(app)
        .post('/auth/signup')
        .send({
          user: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            username,
            email: faker.internet.email(),
            phone: null,
            password: 'mackone'
          }
        })

      const res = await chai
        .request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { username } })

      expect(res).to.have.status(400)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('username must be unique')
    })

    it('Should return 422 when a user tries to use an empty username.', async () => {
      const res = await chai
        .request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { username: '' } })

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('A validation error has occured')
    })

    it('Should return 422 when a user tries to use a username with spaces.', async () => {
      const res = await chai
        .request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { username: '' } })

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('A validation error has occured')
    })

    it('Should return 422 when a user tries to use an empty username.', async () => {
      const res = await chai
        .request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { username: 'test user' } })

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('A validation error has occured')
      expect(res.body.errors.details[0].username).to.equal('user.username cannot contain spaces')
    })
  })

  describe('Update password', () => {
    it('Should return 403 Forbidden when current password is wrong', async () => {
      const res = await chai
        .request(app)
        .patch(`/api/users/${userId}/password`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { currentPassword: 'mackonewrong', password: '1234567890' } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user.message).to.equal('Current password is incorrect')
    })

    it('Should return 200 Success, on successfully updating the password of a user.', async () => {
      const res = await chai
        .request(app)
        .patch(`/api/users/${userId}/password`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { currentPassword: 'mackone', password: '1234567890' } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
    })
  })

  describe('Update a role as an admin', () => {
    it('Should return 200 OK when an admin user tries to update the role of another user.', async () => {
      const res = await chai
        .request(app)
        .patch(`/api/users/${userId}/role`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: { role: userRoles.USER } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
    })
  })

  describe('Update a role as a user', () => {
    it('Should return 403 Forbidden when a user tries to update their own role.', async () => {
      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Pepper', lastName: 'Potts', email: 'rescure@starkindustries.com', phone: '254724374281', password: 'tonyhasaheart' } })

      const resUpdate = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'rescure@starkindustries.com', password: 'tonyhasaheart' } })
      const tokenUpdate = String(resUpdate.body.token)

      const res = await chai
        .request(app)
        .patch(`/api/users/${userId}/role`)
        .set('Authorization', `Bearer ${tokenUpdate}`)
        .send({ user: { role: userRoles.USER } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })

  describe('Update your own role as an admin', () => {
    it('Should return 403 Forbidden when a user tries to update their own role as an admin.', async () => {
      const res = await chai
        .request(app)
        .patch(`/api/users/${userIdAdmin}/role`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: { role: userRoles.USER } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You cannot update your own role')
    })
  })

  describe('Update your notification settings', () => {
    it('Should return 200 when the notification settings of a logged in user are updated.', async () => {
      const res = await chai
        .request(app)
        .patch(`/api/users/${userIdAdmin}/notifications`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: { notifications: { isEnabled: false } } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
    })
  })

  describe('Update notification settings of another user', () => {
    it('Should return 403 when a user tries to update the notification settings of another user.', async () => {
      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Sookie', lastName: 'Stackhouse', email: 'sook@bontemps.com', phone: '254724374281', password: 'vampirebill' } })

      const res1 = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'sook@bontemps.com', password: 'vampirebill' } })
      const res = await chai
        .request(app)
        .patch(`/api/users/${userIdAdmin}/notifications`)
        .set('Authorization', `Bearer ${String(res1.body.token)}`)
        .send({ user: { notifications: { isEnabled: false, expoPushToken: null, fcmTokenWeb: null } } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('Only the owner can perform this action')
    })
  })

  it('should return 200 when a verification code is requested', async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Test', lastName: 'User', email: 'raywiretest@gmail.com', phone: '254724374281', password: 'julien' } })

    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'raywiretest@gmail.com', password: 'julien' } })

    const token = String(resLogin.body.token)
    const userId = String(resLogin.body.user.id)

    const res = await chai
      .request(app)
      .post(`/api/users/${userId}/verify`)
      .set('Authorization', `Bearer ${token}`)
      .send({ user: { email: 'raywiretest@gmail.com' } })

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'user')
    expect(res.body.user.email).to.equal('raywiretest@gmail.com')
    expect(res.body.user.message).to.equal('A verification code has been sent to your email')
  })

  it('should return 400 when a verification code request email fails ', async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Test', lastName: 'User', email: 'raywiretest@gmail.com', phone: '254724374281', password: 'julien' } })

    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'raywiretest@gmail.com', password: 'julien' } })

    const token = String(resLogin.body.token)
    const userId = String(resLogin.body.user.id)

    sgMail.setApiKey('')

    const res = await chai
      .request(app)
      .post(`/api/users/${userId}/verify`)
      .set('Authorization', `Bearer ${token}`)
      .send({ user: { email: 'raywiretest@gmail.com' } })

    expect(res).to.have.status(400)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('email was not sent')
  })

  it('should return 401 when the otp is invalid', async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Diana', lastName: 'Prince', email: 'ww@themyscira.com', phone: '254724374281', password: 'ariessux' } })

    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ww@themyscira.com', password: 'ariessux' } })

    const token = String(resLogin.body.token)
    const userId = String(resLogin.body.user.id)

    const res = await chai
      .request(app)
      .patch(`/api/users/${userId}/verify`)
      .set('Authorization', `Bearer ${token}`)
      .send({ user: { otp: 123, email: 'ww@themyscira.com' } })

    expect(res).to.have.status(401)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('OTP is invalid')
  })

  it('should return 200 when the otp is valid', async () => {
    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'thenaeternal@celestial.com', password: 'kingo123' } })

    const token = String(resLogin.body.token)
    const userId = String(resLogin.body.user.id)

    const res = await chai
      .request(app)
      .patch(`/api/users/${userId}/verify`)
      .set('Authorization', `Bearer ${token}`)
      .send({ user: { otp: 123456, email: 'thenaeternal@celestial.com' } })

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'user')
  })

  it('should return 404 when a user does not exist', async () => {
    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'thenaeternal@celestial.com', password: 'kingo123' } })

    const token = String(resLogin.body.token)
    const userId = String(resLogin.body.user.id)

    const res = await chai
      .request(app)
      .patch(`/api/users/${userId}/verify`)
      .set('Authorization', `Bearer ${token}`)
      .send({ user: { otp: 123456, email: 'thenaeternal0@celestial.com' } })

    expect(res).to.have.status(404)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
  })

  it('should return 403 when the otp has expired', async () => {
    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'sersieternal@celestial.com', password: 'icarussux' } })

    const token = String(resLogin.body.token)
    const userId = String(resLogin.body.user.id)

    const res = await chai
      .request(app)
      .patch(`/api/users/${userId}/verify`)
      .set('Authorization', `Bearer ${token}`)
      .send({ user: { otp: 123456, email: 'sersieternal@celestial.com' } })

    expect(res).to.have.status(403)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('OTP has expired')
  })

  it('should return 204 when a user purges their account', async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Test', lastName: 'User', email: 'tobedeleted@urbntiger.com', phone: '0123456789', password: 'deleteme' } })

    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'tobedeleted@urbntiger.com', password: 'deleteme' } })

    const token = String(resLogin.body.token)
    const userId = String(resLogin.body.user.id)

    const res = await chai
      .request(app)
      .delete(`/api/users/${userId}/purge`)
      .set('Authorization', `Bearer ${token}`)

    const res2 = await chai
      .request(app)
      .delete(`/api/users/${userId}/purge`)
      .set('Authorization', `Bearer ${token}`)

    expect(res).to.have.status(204)
    expect(res2).to.have.status(404)
    expect(res2.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res2.body.errors.message).to.equal('user not found')
  })

  it('should return 403 when a user purges an account that does not belong to them', async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Test', lastName: 'User', email: 'tobedeleted1@urbntiger.com', phone: '0123456789', password: 'deleteme' } })

    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'tobedeleted1@urbntiger.com', password: 'deleteme' } })

    const userId = String(resLogin.body.user.id)

    const res = await chai
      .request(app)
      .delete(`/api/users/${userId}/purge`)
      .set('Authorization', `Bearer ${tokenAdmin}`)

    expect(res).to.have.status(403)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('Only the owner can perform this action')
  })
})
