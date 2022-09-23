import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import { deleteTestUser, createAdminTestUser } from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string

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
  })

  after(async () => {
    await deleteTestUser('drstrange@gmail.com')
  })

  describe('Get all recipients', () => {
    it('Should return 200 Success when an owner successfully retrieves all recipients.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/recipients`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'recipients')
      expect(res.body.recipients).to.be.an('array')
    })

    it('Should return 403 when a non owner tries to retrieve all company recipients.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/recipients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner can perform this action')
    })
  })

  describe('Get a recipient by id', () => {
    it('Should return 403 Forbidden when a company non owner tries to get a recipient.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company.com'
          }
        })

      const resRecipient = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/recipients`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipient: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@doe.com',
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/recipients/${String(resRecipient.body.recipient.id)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner can perform this action')
    })
  })
})
