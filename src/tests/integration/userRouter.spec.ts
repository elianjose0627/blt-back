import sgMail from '@sendgrid/mail'
import chai from 'chai'
import chaiHttp from 'chai-http'
import { faker } from '@faker-js/faker'
import { v1 as uuidv1 } from 'uuid'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  createUserWithOtp,
  createUserWithExpiredOtp,
  createBlockedDomain,
  createVerifiedCompany,
  verifyCompanyDomain,
  deleteAllNonDefaultEmailTemplates,
  iversAtKreeDotKrPassword,
  thenaEternalPassword,
  sersiEternalPassword,
  createCompanyAdministrator
} from '../utils'
import * as userRoles from '../../utils/userRoles'
import { encodeString, encryptUUID } from '../../utils/encryption'

const { expect } = chai

chai.use(chaiHttp)

let token: string
let userId: string
let tokenAdmin: string
let userIdAdmin: string
let emailTemplateTypes: any[]
const ironManPassword = faker.internet.password()
const raywireTestPassword = faker.internet.password()

describe('A user', () => {
  before(async () => {
    await createAdminTestUser()
    await createUserWithOtp()
    await createUserWithExpiredOtp()
    await deleteAllNonDefaultEmailTemplates()
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Tony', lastName: 'Stark', email: 'ironman@starkindustriesmarvel.com', phone: '254720123456', password: ironManPassword } })

    const res1 = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ironman@starkindustriesmarvel.com', password: ironManPassword } })

    const res2 = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: iversAtKreeDotKrPassword } })

    token = res1.body.token
    userId = res1.body.user.id

    tokenAdmin = res2.body.token
    userIdAdmin = res2.body.user.id
  })

  after(async () => {
    await deleteTestUser('ironman@starkindustriesmarvel.com')
    await deleteTestUser('ivers@kree.kr')
    await deleteTestUser('thenaeternal@celestialmarvel.com')
    await deleteTestUser('sersieternal@celestialmarvel.com')
    sgMail.setApiKey(String(process.env.SENDGRID_API_KEY))
  })

  describe('Create a user', () => {
    it('Should return 201 Create, on successfully creating a user.', async () => {
      const res = await chai
        .request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            firstName: 'Warriors',
            lastName: 'Three',
            email: 'warthree@asgard.com',
            phone: '254720123456',
            password: faker.internet.password(),
            role: userRoles.ADMIN
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
    })

    it('Should return 201 Create, on successfully creating a ghost user.', async () => {
      const res = await chai
        .request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            firstName: 'Kang',
            lastName: 'Conqueror',
            email: 'kq@mkangdynastyarvel.com',
            phone: '254720123456',
            password: faker.internet.password(),
            role: userRoles.COMPANYADMINISTRATOR,
            isGhost: true
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
    })

    it('Should return 201 Create, on successfully creating a ghost user who belongs to a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Dynasty Company',
            email: 'test@company16dynastymarvel.com'
          }
        })

      const companyId = resCompany.body.company.id

      const res = await chai
        .request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            firstName: 'Kang',
            lastName: 'Conqueror',
            email: 'kqvariant1@mkangdynastyarvel.com',
            phone: '254720123456',
            password: faker.internet.password(),
            role: userRoles.COMPANYADMINISTRATOR,
            companyId,
            isGhost: true
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
    })

    it('Should return 404 Not Found, on creating a user with a company that does not exist.', async () => {
      const res = await chai
        .request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user:
          {
            firstName: 'Warriors',
            lastName: 'Three',
            email: 'warthree@asgard.com',
            phone: '254720123456',
            password: faker.internet.password(),
            role: userRoles.ADMIN,
            companyId: uuidv1()
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Company not found')
    })

    it('Should return 422 unprocessable entity when an admin tries to create a user with a blocked email domain.', async () => {
      await createBlockedDomain('t-online.de')
      const res = await chai
        .request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            firstName: 'Warriors',
            lastName: 'Three',
            email: 'warthree@t-online.de',
            phone: '254720123456',
            password: faker.internet.password(),
            role: userRoles.ADMIN
          }
        })

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('Kindly register with another email provider, t-online.de is not supported.')
    })
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

    it('Should return 200 Success, on successfully retrieving users when admin tries to fetch all users by role.', async () => {
      const res = await chai
        .request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .query({
          filter: {
            role: 'User'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'meta', 'users')
      expect(res.body.users).to.be.an('array')
      expect(res.body.users.every((user: any) => user.role === 'User')).to.equal(true)
    })

    it('Should return 200 Success, on successfully retrieving users when admin tries to fetch all users by role with search params.', async () => {
      await chai
        .request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            firstName: 'Vincent',
            lastName: 'Chase',
            email: 'vchase@entourage.com',
            phone: '254720123456',
            password: faker.internet.password(),
            role: userRoles.USER
          }
        })
      const res = await chai
        .request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .query({
          search: 'Vincent',
          filter: {
            role: 'User'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'meta', 'users')
      expect(res.body.users).to.be.an('array')
      expect(res.body.users.every((user: any) => user.role === 'User' && user.firstName === 'Vincent')).to.equal(true)
    })

    it('Should return 422 Unprocessable Entity when admin tries to fetch users with an invalid filter.', async () => {
      const res = await chai
        .request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .query({
          filter: {
            role: 'NonExistentRole'
          }
        })

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('A validation error has occurred')
    })
  })

  describe('Search for a user by email', () => {
    it('Should return 200 Success, on successfully retrieving users.', async () => {
      const res = await chai
        .request(app)
        .get('/api/users?search=ironman@starkindustriesmarvel.com')
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

    it('Should return 200 when an admin user updates a username.', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Lady', lastName: 'Siff', email: 'siff@asgard.com', phone: '254720123456', password: faker.internet.password() } })

      const username = faker.internet.userName()
      const userId: string = resUser.body.user.id
      const res = await chai
        .request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: { username } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user.username).to.equal((username).toLowerCase())
    })

    it('Should return 403 when a user tries to update a username of another user.', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Hela', lastName: 'Odindittur', email: 'hela@asgard.com', phone: '254720123456', password: faker.internet.password() } })

      const username = faker.internet.userName()
      const userId: string = resUser.body.user.id
      const res = await chai
        .request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { username } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('Only the owner or admin can perform this action')
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
            password: ironManPassword
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
      expect(res.body.errors.message).to.equal('A validation error has occurred')
    })

    it('Should return 422 when a user tries to use a username with spaces.', async () => {
      const res = await chai
        .request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { username: '' } })

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('A validation error has occurred')
    })

    it('Should return 422 when a user tries to use an empty username.', async () => {
      const res = await chai
        .request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { username: 'test user' } })

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('A validation error has occurred')
      expect(res.body.errors.details[0].username).to.equal('user.username cannot contain spaces')
    })
  })

  describe('Update password', () => {
    it('Should return 403 Forbidden when current password is wrong', async () => {
      const res = await chai
        .request(app)
        .patch(`/api/users/${userId}/password`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { currentPassword: faker.internet.password(), password: faker.internet.password(13) } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user.message).to.equal('Current password is incorrect')
    })

    it('Should return 200 Success, on successfully updating the password of a user.', async () => {
      const res = await chai
        .request(app)
        .patch(`/api/users/${userId}/password`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { currentPassword: ironManPassword, password: faker.internet.password() } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
    })

    it('Should return 200 Success when an admin successfully updates the password of a user.', async () => {
      const res = await chai
        .request(app)
        .patch(`/api/users/${userId}/password-reset-admin`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: { sendEmail: true } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('otp', 'isDeleted')
    })

    it('Should return 200 Success when an admin successfully updates the password of a user.', async () => {
      const res = await chai
        .request(app)
        .patch(`/api/users/${userId}/password-reset-admin`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: { sendEmail: false } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('otp', 'isDeleted')
    })
  })

  describe('Update a user as an admin including user address', () => {
    it('Should return 200 OK when an admin user tries to update the data of another user.', async () => {
      const res = await chai
        .request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            firstName: 'Ryan',
            username: null,
            address: {
              id: null,
              country: 'Kenya',
              city: 'Nairobi',
              zip: '123456'
            }
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
    })

    it('Should return 200 OK when an admin user tries to update the data of another user with an existing address.', async () => {
      await chai
        .request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            firstName: 'Ryan',
            username: null,
            address: {
              id: null,
              country: 'Kenya',
              city: 'Nairobi',
              zip: '123456',
              type: 'delivery'
            }
          }
        })
      const res = await chai
        .request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            firstName: 'Ryan',
            username: null,
            address: {
              id: null,
              country: 'Kenya',
              city: 'Nairobi',
              zip: '123456',
              type: 'delivery'
            }
          }
        })

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
      const randomPassword = faker.internet.password()
      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Pepper', lastName: 'Potts', email: 'rescure@starkindustriesmarvel.com', phone: '254720123456', password: randomPassword } })

      const resUpdate = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'rescure@starkindustriesmarvel.com', password: randomPassword } })
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

  describe('Verify the email of a user', () => {
    it('Should return 200 OK when an admin verifies the email of a user.', async () => {
      const randomPassword = faker.internet.password()
      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Iron', lastName: 'Heart', email: 'iheart@starkindustriesmarvel.com', phone: '254720123456', password: randomPassword } })

      const resUpdate = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'iheart@starkindustriesmarvel.com', password: randomPassword } })
      const userId = String(resUpdate.body.user.id)

      const res = await chai
        .request(app)
        .patch(`/api/users/${userId}/email-verification`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: { isVerified: true } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user.isVerified).to.equal(true)
    })
  })

  describe('Set active state of a user', () => {
    it('Should return 200 OK when an admin activates a user.', async () => {
      const randomPassword = faker.internet.password()
      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Shuri', lastName: 'Shuri', email: 'shuri@starkindustriesmarvel.com', phone: '254720123456', password: randomPassword } })

      const resUpdate = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shuri@starkindustriesmarvel.com', password: randomPassword } })
      const userId = String(resUpdate.body.user.id)

      const res = await chai
        .request(app)
        .patch(`/api/users/${userId}/activate`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: { isActive: true } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user.isActive).to.equal(true)
    })

    it('Should return 200 OK when an admin deactivates a user.', async () => {
      const randomPassword = faker.internet.password()
      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Nakia', lastName: 'Nakia', email: 'nakia@starkindustriesmarvel.com', phone: '254720123456', password: randomPassword } })

      const resUpdate = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nakia@starkindustriesmarvel.com', password: randomPassword } })
      const userId = String(resUpdate.body.user.id)

      const res = await chai
        .request(app)
        .patch(`/api/users/${userId}/activate`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: { isActive: false } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user.isActive).to.equal(false)
    })

    it('Should return 403 Forbidden when an admin tries to update their active state.', async () => {
      const res = await chai
        .request(app)
        .patch(`/api/users/${userIdAdmin}/activate`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: { isActive: false } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You cannot update your own active status')
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
      const randomPassword = faker.internet.password()
      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Sookie', lastName: 'Stackhouse', email: 'sook@bontemps.com', phone: '254720123456', password: randomPassword } })

      const res1 = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'sook@bontemps.com', password: randomPassword } })
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
      .send({ user: { firstName: 'Test', lastName: 'User', email: 'raywiretest@gmail.com', phone: '254720123456', password: raywireTestPassword } })

    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'raywiretest@gmail.com', password: raywireTestPassword } })

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
      .send({ user: { firstName: 'Test', lastName: 'User', email: 'raywiretest@gmail.com', phone: '254720123456', password: raywireTestPassword } })

    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'raywiretest@gmail.com', password: raywireTestPassword } })

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
    const randomPassword = faker.internet.password()
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Diana', lastName: 'Prince', email: 'ww@themyscira.com', phone: '254720123456', password: randomPassword } })

    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ww@themyscira.com', password: randomPassword } })

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
      .send({ user: { email: 'thenaeternal@celestialmarvel.com', password: thenaEternalPassword } })

    const token = String(resLogin.body.token)
    const userId = String(resLogin.body.user.id)

    const res = await chai
      .request(app)
      .patch(`/api/users/${userId}/verify`)
      .set('Authorization', `Bearer ${token}`)
      .send({ user: { otp: 123456, email: 'thenaeternal@celestialmarvel.com' } })

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'user')
  })

  it('should return 404 when a user does not exist', async () => {
    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'thenaeternal@celestialmarvel.com', password: thenaEternalPassword } })

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
      .send({ user: { email: 'sersieternal@celestialmarvel.com', password: sersiEternalPassword } })

    const token = String(resLogin.body.token)
    const userId = String(resLogin.body.user.id)

    const res = await chai
      .request(app)
      .patch(`/api/users/${userId}/verify`)
      .set('Authorization', `Bearer ${token}`)
      .send({ user: { otp: 123456, email: 'sersieternal@celestialmarvel.com' } })

    expect(res).to.have.status(403)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('OTP has expired')
  })

  it('should return 403 when the otp has expired and has been set in the env', async () => {
    process.env.OTP_EXPIRATION = '2'
    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'sersieternal@celestialmarvel.com', password: sersiEternalPassword } })

    const token = String(resLogin.body.token)
    const userId = String(resLogin.body.user.id)

    const res = await chai
      .request(app)
      .patch(`/api/users/${userId}/verify`)
      .set('Authorization', `Bearer ${token}`)
      .send({ user: { otp: 123456, email: 'sersieternal@celestialmarvel.com' } })

    expect(res).to.have.status(403)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('OTP has expired')
  })

  it('should return 204 when a user purges their account', async () => {
    const randomPassword = faker.internet.password()
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Test', lastName: 'User', email: 'tobedeleted@urbntiger.com', phone: '0123456789', password: randomPassword } })

    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'tobedeleted@urbntiger.com', password: randomPassword } })

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
    const randomPassword = faker.internet.password()
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Test', lastName: 'User', email: 'tobedeleted1@urbntiger.com', phone: '0123456789', password: randomPassword } })

    const resLogin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'tobedeleted1@urbntiger.com', password: randomPassword } })

    const userId = String(resLogin.body.user.id)

    const res = await chai
      .request(app)
      .delete(`/api/users/${userId}/purge`)
      .set('Authorization', `Bearer ${tokenAdmin}`)

    expect(res).to.have.status(403)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('Only the owner can perform this action')
  })

  describe('Create an address', () => {
    const randomPassword = faker.internet.password()
    before(async () => {
      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Auth', lastName: 'May', email: 'auymay@starkindustriesmarvel.com', phone: '254720123456', password: randomPassword } })

      const res1 = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'auymay@starkindustriesmarvel.com', password: randomPassword } })

      const res2 = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ivers@kree.kr', password: iversAtKreeDotKrPassword } })

      token = res1.body.token
      userId = res1.body.user.id

      tokenAdmin = res2.body.token
      userIdAdmin = res2.body.user.id
    })
    it('Should return 201 Created when a user successfully creates an address.', async () => {
      const res = await chai
        .request(app)
        .post(`/api/users/${String(userId)}/address`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'address')
      expect(res.body.address).to.be.an('object')
      expect(res.body.address).to.include.keys('id', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })

    it('Should return 200 Success when a user tries to create an address that exists.', async () => {
      await chai
        .request(app)
        .post(`/api/users/${String(userId)}/address`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nakuru'
          }
        })
      const res = await chai
        .request(app)
        .post(`/api/users/${String(userId)}/address`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nakuru'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'address')
      expect(res.body.address).to.be.an('object')
      expect(res.body.address).to.include.keys('id', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })

    it('Should return 200 Success when an admin tries to create an address that exists.', async () => {
      const res = await chai
        .request(app)
        .post(`/api/users/${String(userId)}/address`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nakuru'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'address')
      expect(res.body.address).to.be.an('object')
      expect(res.body.address).to.include.keys('id', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a non-owner tries to create an address.', async () => {
      const res = await chai
        .request(app)
        .post(`/api/users/${String(userIdAdmin)}/address`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or admin can perform this action')
      expect(res.body.success).to.equal(false)
    })
  })

  describe('Get all addresses of a user', () => {
    it('Should return 200 when a user fetches their own addresses with search and filter params', async () => {
      await chai
        .request(app)
        .post(`/api/users/${String(userId)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi',
            firstName: 'Test',
            lastName: 'User',
            type: 'delivery',
            affiliation: 'personal'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/users/${String(userId)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .query({
          limit: 10,
          page: 1,
          search: 'Test',
          filter: {
            type: 'delivery',
            affiliation: 'personal'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'addresses')
      expect(res.body.addresses).to.be.an('array').lengthOf.above(0)
    })
    it('Should return 200 when a user fetches their own addresses', async () => {
      await chai
        .request(app)
        .post(`/api/users/${String(userId)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi',
            firstName: 'Test',
            lastName: 'User',
            type: 'delivery'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/users/${String(userId)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .query({
          limit: 10,
          page: 1
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'addresses')
      expect(res.body.addresses).to.be.an('array').lengthOf.above(0)
    })
  })

  describe('Update user company', () => {
    it('Should return 404 when an admin tries to update the company of a user with a company that does not exist', async () => {
      const res = await chai
        .request(app)
        .patch(`/api/users/${String(userId)}/company`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            companyId: uuidv1()
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Company not found')
      expect(res.body.success).to.equal(false)
    })

    it('Should return 200 OK when an admin updates the company of a user', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Test', lastName: 'User', email: 'testuser@biglittlethings.de', phone: '254720123456', password: faker.internet.password() } })

      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Dynasty Company',
            email: 'test@company17dynastymarvel.com'
          }
        })

      const companyId = resCompany.body.company.id

      const res = await chai
        .request(app)
        .patch(`/api/users/${String(resUser.body.user.id)}/company`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            companyId
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.success).to.equal(true)
      expect(res.body.user.role).to.equal(userRoles.USER)
    })

    it('Should return 200 OK when an admin updates the company of a user and role', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'TestRole', lastName: 'User', email: 'testuserrole@biglittlethings.de', phone: '254720123456', password: faker.internet.password() } })

      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Dynasty Company',
            email: 'test@company17roledynastymarvel.com'
          }
        })

      const companyId = resCompany.body.company.id

      const res = await chai
        .request(app)
        .patch(`/api/users/${String(resUser.body.user.id)}/company`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            companyId,
            role: userRoles.EMPLOYEE
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.success).to.equal(true)
      expect(res.body.user.role).to.equal(userRoles.EMPLOYEE)
    })

    it('Should return 200 OK when an admin updates the company of a user with null and role', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'TestNullCompany', lastName: 'User', email: 'testnullcompany@biglittlethings.de', phone: '254720123456', password: faker.internet.password() } })

      const res = await chai
        .request(app)
        .patch(`/api/users/${String(resUser.body.user.id)}/company`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            companyId: null,
            role: userRoles.ADMIN
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.success).to.equal(true)
      expect(res.body.user.role).to.equal(userRoles.ADMIN)
    })

    it('Should return 422 Unprocessable Entity when an admin updates the company of a user with null and role that is not admin', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'TestNullCompany', lastName: 'User', email: 'testnullcompanynotadmin@biglittlethings.de', phone: '254720123456', password: faker.internet.password() } })

      const res = await chai
        .request(app)
        .patch(`/api/users/${String(resUser.body.user.id)}/company`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            companyId: null,
            role: userRoles.COMPANYADMINISTRATOR
          }
        })

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('A validation error has occurred')
      expect(res.body.success).to.equal(false)
    })
  })

  describe('Company invitation code', () => {
    it('Should return 200 OK when a user joins a company using an invitation code.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const resCompanyInvite = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/invite-link`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      const companyInviteCode = resCompanyInvite.body.company.inviteCode
      const randomPassword = faker.internet.password()

      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Test', lastName: 'User', email: 'testuser2024feb@biglittlethings.de', phone: '254720123456', password: randomPassword } })

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'testuser2024feb@biglittlethings.de', password: randomPassword } })

      const res = await chai
        .request(app)
        .patch(`/api/users/${String(resUser.body.user.id)}/company-invite`)
        .set('Authorization', `Bearer ${String(resUser.body.token)}`)
        .send({
          user: {
            companyInviteCode
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.success).to.equal(true)
      expect(res.body.user.role).to.equal(userRoles.EMPLOYEE)
    })

    it('Should return 200 OK when a user joins a company using an invitation code for campaign manager.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const resCompanyInvite = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/invite-link`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      const companyInviteCode = resCompanyInvite.body.company.roles.campaignManager.shortInviteCode
      const randomPassword = faker.internet.password()

      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Test', lastName: 'User', email: 'testuser2024feb28@biglittlethings.de', phone: '254720123456', password: randomPassword } })

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'testuser2024feb28@biglittlethings.de', password: randomPassword } })

      const res = await chai
        .request(app)
        .patch(`/api/users/${String(resUser.body.user.id)}/company-invite`)
        .set('Authorization', `Bearer ${String(resUser.body.token)}`)
        .send({
          user: {
            companyInviteCode
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.success).to.equal(true)
      expect(res.body.user.role).to.equal(userRoles.CAMPAIGNMANAGER)
    })

    it('Should return 200 OK when a user joins a company that has a set invite tokens using an invitation code.', async () => {
      const password = faker.internet.password()
      const companyAdmin = await createCompanyAdministrator('test@companyinvitedtokentwo.com', password)

      const companyId = companyAdmin.companyId
      await verifyCompanyDomain(companyId)

      const resCompanyInvite = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/invite-link`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyInviteToken: {
            roles: [userRoles.CAMPAIGNMANAGER, userRoles.COMPANYADMINISTRATOR, userRoles.EMPLOYEE]
          }
        })

      const companyInviteCode = resCompanyInvite.body.company.inviteCode
      const randomPassword = faker.internet.password()

      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Test', lastName: 'User', email: 'testuser2024feb12@biglittlethings.de', phone: '254720123456', password: randomPassword } })

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'testuser2024feb12@biglittlethings.de', password: randomPassword } })

      const res = await chai
        .request(app)
        .patch(`/api/users/${String(resUser.body.user.id)}/company-invite`)
        .set('Authorization', `Bearer ${String(resUser.body.token)}`)
        .send({
          user: {
            companyInviteCode
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.success).to.equal(true)
      expect(res.body.user.role).to.equal(userRoles.EMPLOYEE)
    })

    it('Should return 200 OK when a user joins a company that has a set invite tokens using an invitation code for campaign manager.', async () => {
      const password = faker.internet.password()
      const companyAdmin = await createCompanyAdministrator('test@companyinvitedtokentwohalf.com', password)

      const companyId = companyAdmin.companyId
      await verifyCompanyDomain(companyId)

      const resCompanyInvite = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/invite-link`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyInviteToken: {
            roles: [userRoles.CAMPAIGNMANAGER, userRoles.COMPANYADMINISTRATOR, userRoles.EMPLOYEE]
          }
        })

      const companyInviteCode = resCompanyInvite.body.company.roles.campaignManager.shortInviteCode
      const randomPassword = faker.internet.password()

      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Test', lastName: 'User', email: 'testuser2024feb13@biglittlethings.de', phone: '254720123456', password: randomPassword } })

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'testuser2024feb13@biglittlethings.de', password: randomPassword } })

      const res = await chai
        .request(app)
        .patch(`/api/users/${String(resUser.body.user.id)}/company-invite`)
        .set('Authorization', `Bearer ${String(resUser.body.token)}`)
        .send({
          user: {
            companyInviteCode
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.success).to.equal(true)
      expect(res.body.user.role).to.equal(userRoles.CAMPAIGNMANAGER)
    })

    it('Should return 200 OK when a user joins a company using an invitation code.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const resCompanyInvite = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/invite-link`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      const companyInviteCode = resCompanyInvite.body.company.shortInviteCode
      const randomPassword = faker.internet.password()

      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Test', lastName: 'User', email: 'testuser2024febshort@biglittlethings.de', phone: '254720123456', password: randomPassword } })

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'testuser2024febshort@biglittlethings.de', password: randomPassword } })

      const res = await chai
        .request(app)
        .patch(`/api/users/${String(resUser.body.user.id)}/company-invite`)
        .set('Authorization', `Bearer ${String(resUser.body.token)}`)
        .send({
          user: {
            companyInviteCode
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.success).to.equal(true)
      expect(res.body.user.role).to.equal(userRoles.EMPLOYEE)
    })

    it('Should return 200 OK when a user successfully joins a company that has a set domain check to true using an invitation code for campaign manager.', async () => {
      const password = faker.internet.password()
      const companyAdmin = await createCompanyAdministrator('test@companyinvitedtokentwotwohalf1.com', password)

      const companyId = companyAdmin.companyId
      await verifyCompanyDomain(companyId)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/invite-domain-check`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyInviteToken: {
            roles: {
              Employee: false,
              CampaignManager: true,
              CompanyAdministrator: false
            }
          }
        })

      const resCompanyInvite = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/invite-link`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      const companyInviteCode = resCompanyInvite.body.company.roles.campaignManager.shortInviteCode
      const randomPassword = faker.internet.password()

      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Test', lastName: 'User', email: 'domain@companyinvitedtokentwotwohalf1.com', phone: '254720123456', password: randomPassword } })

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'domain@companyinvitedtokentwotwohalf1.com', password: randomPassword } })

      const res = await chai
        .request(app)
        .patch(`/api/users/${String(resUser.body.user.id)}/company-invite`)
        .set('Authorization', `Bearer ${String(resUser.body.token)}`)
        .send({
          user: {
            companyInviteCode
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.success).to.equal(true)
      expect(res.body.user.role).to.equal(userRoles.CAMPAIGNMANAGER)
    })

    it('Should return 403 Forbidden when a user tries to join a company that has a set domain check to true using an invitation code for campaign manager.', async () => {
      const password = faker.internet.password()
      const companyAdmin = await createCompanyAdministrator('test@companyinvitedtokentwotwohalf.com', password)

      const companyId = companyAdmin.companyId
      await verifyCompanyDomain(companyId)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/invite-domain-check`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyInviteToken: {
            roles: {
              Employee: false,
              CampaignManager: true,
              CompanyAdministrator: false
            }
          }
        })

      const resCompanyInvite = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/invite-link`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      const companyInviteCode = resCompanyInvite.body.company.roles.campaignManager.shortInviteCode
      const randomPassword = faker.internet.password()

      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Test', lastName: 'User', email: 'domain@differentdomain.com', phone: '254720123456', password: randomPassword } })

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'domain@differentdomain.com', password: randomPassword } })

      const res = await chai
        .request(app)
        .patch(`/api/users/${String(resUser.body.user.id)}/company-invite`)
        .set('Authorization', `Bearer ${String(resUser.body.token)}`)
        .send({
          user: {
            companyInviteCode
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('The email domain and the company domains do not match')
    })

    it('should return 404 Not Found if a user tries to join using an invite code for a company that does not exist', async () => {
      const uuid = uuidv1()
      const encryptedUUID = encryptUUID(uuid, 'base64', uuid)
      const encryptedUUIDWithCompanyIdBase64 = encodeString(`${encryptedUUID}.${uuid}`, 'base64')
      const randomPassword = faker.internet.password()

      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Test', lastName: 'User', email: 'testuser20241921@biglittlethings.de', phone: '254720123456', password: randomPassword } })

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'testuser20241921@biglittlethings.de', password: randomPassword } })

      const res = await chai
        .request(app)
        .patch(`/api/users/${String(resUser.body.user.id)}/company-invite`)
        .set('Authorization', `Bearer ${String(resUser.body.token)}`)
        .send({
          user: {
            companyInviteCode: encryptedUUIDWithCompanyIdBase64
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('Company not found')
    })

    it('should return 422 Unprocessable entity if a user tries to join a company using an invalid invite code', async () => {
      const companyInviteCode = 'SnB6eXVvTHpXdlBCeWNsdUpkR3VndkFlbXptSEp3Zm9HUXY2RGdZMEdDY28wRXcyTDM1R3EvaUJBRkcwZWUrVy5kMmM0NTc0MC1mNGM5LTExZWQtY'
      const randomPassword = faker.internet.password()

      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Test', lastName: 'User', email: 'testuser20241922@biglittlethings.de', phone: '254720123456', password: randomPassword } })

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'testuser20241922@biglittlethings.de', password: randomPassword } })

      const res = await chai
        .request(app)
        .patch(`/api/users/${String(resUser.body.user.id)}/company-invite`)
        .set('Authorization', `Bearer ${String(resUser.body.token)}`)
        .send({
          user: {
            companyInviteCode
          }
        })

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('Invalid invitation code')
    })

    it('should return 422 Unprocessable entity if a user tries to join a company using an invalid invite code that on decryption is not a guid', async () => {
      const encryptedNoneUUID = encryptUUID('123456780123401234012340123456789012', 'base64', uuidv1())
      const encodeDncryptedNoneUUIDWithCompanyIdToBase64 = encodeString(`${encryptedNoneUUID}.${uuidv1()}`, 'base64')
      const randomPassword = faker.internet.password()

      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Test', lastName: 'User', email: 'testuser20241923@biglittlethings.de', phone: '254720123456', password: randomPassword } })

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'testuser20241923@biglittlethings.de', password: randomPassword } })

      const res = await chai
        .request(app)
        .patch(`/api/users/${String(resUser.body.user.id)}/company-invite`)
        .set('Authorization', `Bearer ${String(resUser.body.token)}`)
        .send({
          user: {
            companyInviteCode: encodeDncryptedNoneUUIDWithCompanyIdToBase64
          }
        })

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('Invalid invitation code')
    })
  })

  describe('Email templates for users', () => {
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
            subject: 'Account Welcome',
            template: 'Hello World, [salutation] [firstname] [lastname], [role], [app], [url], [adminurl], [mailer], [salesmailer], [password]',
            emailTemplateTypeId: accountWelcomeAdminEmailTemplateType.id
          }
        })

      const res = await chai
        .request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            firstName: 'Warriors',
            lastName: 'Three',
            email: 'warthree@asgardtemplate.com',
            phone: '254720123456',
            password: faker.internet.password(),
            role: userRoles.ADMIN
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
    })

    it('Should return 200 Success, on successfully updating the password of a user when an email template exists.', async () => {
      const updatePasswordEmailTemplateType = emailTemplateTypes.find(emailTemplateType => emailTemplateType.type === 'updatePassword')
      await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Password Reset',
            template: 'Hello World, [salutation] [firstname] [lastname], [role], [app], [url], [adminurl], [mailer], [salesmailer], [password]',
            emailTemplateTypeId: updatePasswordEmailTemplateType.id
          }
        })
      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Tony', lastName: 'Stark', email: 'ironman@starkindustriesmarveltemplate.com', phone: '254720123456', password: ironManPassword } })

      const resLogin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ironman@starkindustriesmarveltemplate.com', password: ironManPassword } })

      const res = await chai
        .request(app)
        .patch(`/api/users/${String(resLogin.body.user.id)}/password`)
        .set('Authorization', `Bearer ${String(resLogin.body.token)}`)
        .send({ user: { currentPassword: ironManPassword, password: faker.internet.password() } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
    })

    it('Should return 200 Success when an admin successfully updates the password of a user when a reset template exists.', async () => {
      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Tony', lastName: 'Stark', email: 'ironman@starkindustriesmarveltemplate2.com', phone: '254720123456', password: ironManPassword } })

      const resLogin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ironman@starkindustriesmarveltemplate2.com', password: ironManPassword } })
      const res = await chai
        .request(app)
        .patch(`/api/users/${String(resLogin.body.user.id)}/password-reset-admin`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ user: { sendEmail: true } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('otp', 'isDeleted')
    })

    it('should return 200 when a verification code is requested when a reset template exists', async () => {
      sgMail.setApiKey(String(process.env.SENDGRID_API_KEY))
      const accountVerificationEmailTemplateType = emailTemplateTypes.find(emailTemplateType => emailTemplateType.type === 'accountVerification')
      await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Account Verification',
            template: 'Hello World, [salutation] [firstname] [lastname], [role], [app], [url], [adminurl], [mailer], [salesmailer], [password]',
            emailTemplateTypeId: accountVerificationEmailTemplateType.id
          }
        })
      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Test', lastName: 'User', email: 'raywiretest@gmail.com', phone: '254720123456', password: raywireTestPassword } })

      const resLogin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'raywiretest@gmail.com', password: raywireTestPassword } })

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
  })
})
