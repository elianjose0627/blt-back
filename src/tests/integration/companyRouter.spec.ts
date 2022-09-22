import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import { deleteTestUser, createAdminTestUser } from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
// let userIdAdmin: string
let token: string
// let userId: string

describe('Company actions', () => {
  before(async () => {
    await createAdminTestUser()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustries.com', phone: '254724374281', password: 'mackone' } })

    const res1 = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'shehulk@starkindustries.com', password: 'mackone' } })

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: 'thebiggun' } })

    tokenAdmin = resAdmin.body.token
    token = res1.body.token
    // userId = res1.body.user.id
  })

  after(async () => {
    await deleteTestUser('drstrange@gmail.com')
  })

  describe('Get all companies', () => {
    it('Should return 200 Success when an admin successfully retrieves all companies.', async () => {
      const res = await chai
        .request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companies')
      expect(res.body.companies).to.be.an('array')
    })

    it('Should return 403 when a non admin tries to retrieve all companies.', async () => {
      const res = await chai
        .request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })

  describe('Create a company', () => {
    it('Should return 201 Create when a user creates a company.', async () => {
      const res = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company.com'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a user creates the same company company.', async () => {
      const res = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company.com'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
    })
  })
})
