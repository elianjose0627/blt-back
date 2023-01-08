import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import { deleteTestUser, createAdminTestUser } from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let userIdAdmin: string
let token: string
let userId: string

describe('Profile actions', () => {
  before(async () => {
    await createAdminTestUser()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustriesmarvel.com', phone: '254720123456', password: 'mackone' } })

    const res1 = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: 'mackone' } })

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: 'thebiggun' } })

    tokenAdmin = resAdmin.body.token
    token = res1.body.token
    userId = res1.body.user.id
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Get my Profile', () => {
    it('Should return 200 Success, on successfully retrieving profile of logged in user.', async () => {
      const res = await chai
        .request(app)
        .get('/api/profiles/me')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
    })
  })

  it('Should return 200 when an admin fetches a profile by id', async () => {
    const res = await chai
      .request(app)
      .get(`/api/profiles/${userIdAdmin}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'profile')
    expect(res.body.profile).to.include.keys('id', 'firstName', 'lastName', 'username', 'photo')
  })

  it('Should return 200 when a user fetches a profile by id', async () => {
    const res = await chai
      .request(app)
      .get(`/api/profiles/${userId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('statusCode', 'success', 'profile')
    expect(res.body.profile).to.include.keys('id', 'firstName', 'lastName', 'username', 'photo')
  })
})
