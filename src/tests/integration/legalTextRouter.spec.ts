import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  createCompanyAdministrator
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let tokenCompanyAdmin: string
let token: string

describe('Legal Text actions', () => {
  before(async () => {
    await createAdminTestUser()
    await createCompanyAdministrator()

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

    const resCompanyAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

    tokenAdmin = resAdmin.body.token
    token = resUser.body.token
    tokenCompanyAdmin = resCompanyAdmin.body.token
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Create a legal text', () => {
    it('Should return 201 Created when an admin creates a legal text.', async () => {
      const res = await chai
        .request(app)
        .post('/api/legal-texts')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          legalText: {
            type: 'privacy',
            template: {
              title: 'Privacy Policy',
              sections: [
                {
                  title: 'Privacy Policy',
                  content: 'Content'
                }
              ]
            }
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'legalText')
      expect(res.body.legalText).to.be.an('object')
      expect(res.body.legalText).to.include.keys('id', 'type', 'template', 'createdAt', 'updatedAt')
    })
  })

  describe('Get all legal texts', () => {
    it('Should return 200 OK when a user gets legal texts.', async () => {
      const res = await chai
        .request(app)
        .get('/api/legal-texts')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'legalTexts')
      expect(res.body.legalTexts).to.be.an('array')
    })

    it('Should return 200 OK when an admin gets all legal texts.', async () => {
      const res = await chai
        .request(app)
        .get('/api/legal-texts')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'legalTexts')
      expect(res.body.legalTexts).to.be.an('array')
    })

    it('Should return 200 OK when a company admin gets all legal texts.', async () => {
      const res = await chai
        .request(app)
        .get('/api/legal-texts')
        .set('Authorization', `Bearer ${tokenCompanyAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'legalTexts')
      expect(res.body.legalTexts).to.be.an('array')
    })

    it('Should return 200 OK when a company admin gets all legal texts with filter params.', async () => {
      const res = await chai
        .request(app)
        .get('/api/legal-texts')
        .set('Authorization', `Bearer ${tokenCompanyAdmin}`)
        .query({
          limit: 10,
          page: 1,
          'filter[type]': 'defaultTerms'
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'legalTexts')
      expect(res.body.legalTexts).to.be.an('array')
    })
  })
})
