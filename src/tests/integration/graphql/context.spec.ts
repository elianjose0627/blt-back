import chai from 'chai'
import chaiHttp from 'chai-http'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import app from '../../../app'
import * as statusCodes from '../../../constants/statusCodes'
import generateToken from '../../../utils/generateToken'
import * as userRoles from '../../../utils/userRoles'

const { expect } = chai

chai.use(chaiHttp)

describe('Context', () => {
  before(async () => {

  })

  after(async () => {

  })

  describe('Auth Context', () => {
    it('Should return error when no token is provided', async () => {
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
        .send({
          query
        })

      expect(res).to.have.status(statusCodes.UNAUTHORIZED)
      expect(res.body.errors[0].message).to.be.equal('No auth token')
      expect(res.body.errors[0].extensions.code).to.be.equal('UNAUTHORIZED')
    })

    it('Should return error when invalid token with no email is provided', async () => {
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

      const token = jwt.sign({ test: 'test' }, process.env.SECRET_KEY as string)

      const res = await chai
        .request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query
        })

      expect(res).to.have.status(statusCodes.UNAUTHORIZED)
      expect(res.body.errors[0].message).to.be.equal('token not valid')
      expect(res.body.errors[0].extensions.code).to.be.equal('UNAUTHORIZED')
    })

    it('Should return error when invalid token with invalid id is provided', async () => {
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

      const token = jwt.sign({ id: 'test' }, process.env.SECRET_KEY as string)

      const res = await chai
        .request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query
        })

      expect(res).to.have.status(statusCodes.UNAUTHORIZED)
      expect(res.body.errors[0].message).to.be.equal('token not valid')
      expect(res.body.errors[0].extensions.code).to.be.equal('UNAUTHORIZED')
    })

    it('Should return error when invalid token with invalid secret key is provided', async () => {
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

      const token = jwt.sign({ id: 'test' }, 'invalid-secret-key')

      const res = await chai
        .request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query
        })

      expect(res).to.have.status(statusCodes.UNAUTHORIZED)
      expect(res.body.errors[0].message).to.be.equal('invalid signature')
      expect(res.body.errors[0].extensions.code).to.be.equal('UNAUTHORIZED')
    })

    it('Should return error when valid token with a user that does not exist is provided', async () => {
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

      const token = generateToken({ id: uuidv4(), email: 'test@test.com', role: userRoles.USER, logoutTime: null, isVerified: true }, 'login', '10 minutes')

      const res = await chai
        .request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query
        })

      expect(res).to.have.status(statusCodes.UNAUTHORIZED)
      expect(res.body.errors[0].message).to.be.equal('user not found')
      expect(res.body.errors[0].extensions.code).to.be.equal('UNAUTHORIZED')
    })
  })
})
