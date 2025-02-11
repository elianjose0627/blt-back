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

describe('Title resolver', () => {
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
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Query.titles', () => {
    it('Should return titles list when queried', async () => {
      const query = `
        query GetTitles($limit: Int, $page: Int) {
          titles(limit: $limit, page: $page) {
            statusCode
            success
            meta {
              page
              pageCount
              perPage
              total
            }
            titles {
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
      expect(res.body.data.titles).to.have.property('statusCode')
      expect(res.body.data.titles).to.have.property('success')
      expect(res.body.data.titles).to.have.property('meta')
      expect(res.body.data.titles).to.have.property('titles')
      expect(res.body.data.titles.titles).to.be.an('array')
    })

    it('Should return titles list when queried with no limit and page', async () => {
      const query = `
        query GetTitles {
          titles {
            statusCode
            success
            meta {
              page
              pageCount
              perPage
              total
            }
            titles {
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
      expect(res.body.data.titles).to.have.property('statusCode')
      expect(res.body.data.titles).to.have.property('success')
      expect(res.body.data.titles).to.have.property('meta')
      expect(res.body.data.titles).to.have.property('titles')
      expect(res.body.data.titles.titles).to.be.an('array')
    })
  })

  describe('Query.title', () => {
    it('Should return a title when queried by id', async () => {
      // First create a title through REST API
      const resTitle = await chai
        .request(app)
        .post('/api/titles')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          title: {
            name: `${faker.name.prefix()} ${faker.name.lastName()}`
          }
        })

      const titleId = resTitle.body.title.id

      const query = `
        query GetTitle($id: ID!) {
          title(id: $id) {
            statusCode
            success
            title {
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
            id: titleId
          }
        })

      expect(res).to.have.status(200)
      expect(res.body.data.title).to.have.property('statusCode')
      expect(res.body.data.title).to.have.property('success')
      expect(res.body.data.title).to.have.property('title')
      expect(res.body.data.title.title).to.be.an('object')
      expect(res.body.data.title.title).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return a null title when queried by id that does not exist', async () => {
      const query = `
        query GetTitle($id: ID!) {
          title(id: $id) {
            statusCode
            success
            title {
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
      expect(res.body.data.title).to.have.property('statusCode')
      expect(res.body.data.title).to.have.property('success')
      expect(res.body.data.title).to.have.property('title')
      expect(res.body.data.title.title).to.be.equal(null)
      expect(res.body.data.title.statusCode).to.be.equal(statusCodes.NOT_FOUND)
      expect(res.body.data.title.success).to.be.equal(false)
    })
  })
})
