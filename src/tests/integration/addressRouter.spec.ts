import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import { deleteTestUser, createAdminTestUser } from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
// let userIdAdmin: string
// let token: string
// let userId: string

describe('Address actions', () => {
  before(async () => {
    await createAdminTestUser()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Jeniffer', lastName: 'Walters', email: 'jenwalters@starkindustries.com', phone: '254724374281', password: 'smashagain' } })

    // const res1 = await chai
    //   .request(app)
    //   .post('/auth/login')
    //   .send({ user: { email: 'jenwalters@starkindustries.com', password: 'smashagain' } })

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: 'thebiggun' } })

    tokenAdmin = resAdmin.body.token
    // token = res1.body.token
    // userId = res1.body.user.id
  })

  after(async () => {
    await deleteTestUser('drstrange@gmail.com')
  })

  describe('Update an address', () => {
    xit('Should return 200 Success when a company owner successfully updates an address.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company 2',
            email: 'ivers@kree.kr'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/address`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const resUpdate = await chai
        .request(app)
        .put(`/api/addresses/${String(res.body.address.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nakuru',
            street: 'Kanu Street'
          }
        })

      expect(resUpdate).to.have.status(200)
      expect(resUpdate.body).to.include.keys('statusCode', 'success', 'address')
      expect(resUpdate.body.address).to.be.an('object')
      expect(resUpdate.body.address).to.include.keys('id', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })
  })
})
