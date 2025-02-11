import chai from 'chai'
import chaiHttp from 'chai-http'
import { faker } from '@faker-js/faker'
import { v4 as uuidv4 } from 'uuid'
import app from '../../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  iversAtKreeDotKrPassword,
  sheHulkAtStarkIndustriesPassword
} from '../../utils'
import * as statusCodes from '../../../constants/statusCodes'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string

describe('Salutation resolver', () => {
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
    await chai
      .request(app)
      .post('/api/salutations')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        salutation: {
          name: `${faker.name.prefix()} ${faker.name.lastName()}`
        }
      })
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Query.salutations', () => {
    it('Should return salutations list when queried', async () => {
      const query = `
        query GetSalutations($limit: Int, $page: Int) {
          salutations(limit: $limit, page: $page) {
            statusCode
            success
            meta {
              page
              pageCount
              perPage
              total
            }
            salutations {
              id
              name
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
          query,
          variables: {
            limit: 10,
            page: 1
          }
        })

      expect(res).to.have.status(200)
      expect(res.body.data.salutations).to.have.property('statusCode')
      expect(res.body.data.salutations).to.have.property('success')
      expect(res.body.data.salutations).to.have.property('meta')
      expect(res.body.data.salutations).to.have.property('salutations')
      expect(res.body.data.salutations.salutations).to.be.an('array')
    })
    it('Should return salutations list when queried with no limit and page', async () => {
      const query = `
        query GetSalutations {
          salutations {
            statusCode
            success
            meta {
              page
              pageCount
              perPage
              total
            }
            salutations {
              id
              name
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

      expect(res).to.have.status(200)
      expect(res.body.data.salutations).to.have.property('statusCode')
      expect(res.body.data.salutations).to.have.property('success')
      expect(res.body.data.salutations).to.have.property('meta')
      expect(res.body.data.salutations).to.have.property('salutations')
      expect(res.body.data.salutations.salutations).to.be.an('array')
    })
  })

  describe('Query.salutation', () => {
    it('Should return a salutation when queried by id', async () => {
      // First create a salutation through REST API
      const resSalutation = await chai
        .request(app)
        .post('/api/salutations')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salutation: {
            name: `${faker.name.prefix()} ${faker.name.lastName()}`
          }
        })

      const salutationId = resSalutation.body.salutation.id

      const query = `
        query GetSalutation($id: ID!) {
          salutation(id: $id) {
            statusCode
            success
            salutation {
              id
              name
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
          query,
          variables: {
            id: salutationId
          }
        })

      expect(res).to.have.status(200)
      expect(res.body.data.salutation).to.have.property('statusCode')
      expect(res.body.data.salutation).to.have.property('success')
      expect(res.body.data.salutation).to.have.property('salutation')
      expect(res.body.data.salutation.salutation).to.be.an('object')
      expect(res.body.data.salutation.salutation).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return a null salutation when queried by id that does not exist', async () => {
      const query = `
        query GetSalutation($id: ID!) {
          salutation(id: $id) {
            statusCode
            success
            salutation {
              id
              name
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
          query,
          variables: {
            id: uuidv4()
          }
        })

      expect(res).to.have.status(200)
      expect(res.body.data.salutation).to.have.property('statusCode')
      expect(res.body.data.salutation).to.have.property('success')
      expect(res.body.data.salutation).to.have.property('salutation')
      expect(res.body.data.salutation.salutation).to.be.equal(null)
      expect(res.body.data.salutation.statusCode).to.be.equal(statusCodes.NOT_FOUND)
      expect(res.body.data.salutation.success).to.be.equal(false)
    })
  })
})
