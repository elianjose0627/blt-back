import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../../app'
import {
  createAdminTestUser,
  verifyUser,
  iversAtKreeDotKrPassword,
  sheHulkAtStarkIndustriesPassword
} from '../../utils'
import * as statusCodes from '../../../constants/statusCodes'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string

describe('Profile resolver', () => {
  before(async () => {
    await createAdminTestUser()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustriesmarvel.com', phone: '254720123456', password: sheHulkAtStarkIndustriesPassword } })

    await verifyUser('shehulk@starkindustriesmarvel.com')

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: iversAtKreeDotKrPassword } })

    tokenAdmin = resAdmin.body.token
  })

  after(async () => {

  })

  describe('Query.profile', () => {
    it('Should return profile when queried', async () => {
      const query = `
        query GetProfile {
          profile {
            statusCode
            success
            profile {
              id
              firstName
              lastName
              email
              phone
              createdAt
              updatedAt
            }
          }
        }
      `

      const res = await chai
        .request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          query
        })

      expect(res).to.have.status(statusCodes.OK)
      expect(res.body.data.profile).to.have.property('statusCode')
      expect(res.body.data.profile).to.have.property('success')
      expect(res.body.data.profile).to.have.property('profile')
      expect(res.body.data.profile.profile).to.be.an('object')
      expect(res.body.data.profile.profile).to.have.all.keys('id', 'firstName', 'lastName', 'email', 'phone', 'createdAt', 'updatedAt')
    })
  })
})
