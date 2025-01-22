import chai from 'chai'
import chaiHttp from 'chai-http'
import fs from 'fs'
import path from 'path'
import app from '../../app'
import {
  deleteTestUser,
  verifyUser
} from '../utils'
import { faker } from '@faker-js/faker'

const { expect } = chai

chai.use(chaiHttp)

const username: string = 'fakeruser'
const password: string = faker.internet.password()
const email: string = 'faker.user@getec.com'

describe('GETEC file actions', () => {
  before(async () => {
    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', username, email, phone: '254720123456', password } })

    await verifyUser(email)
  })

  after(async () => {
    await deleteTestUser(email)
  })

  describe('File Upload for Getec Action', () => {
    it('Should return 201 Created when an admin successfully created pending order.', async () => {
      const basicAuth = Buffer.from(`${username}:${password}`).toString('base64')
      const filePath = path.join(__dirname, '../test.xml')
      const res = await chai
        .request(app)
        .post('/api/file/upload')
        .set('Authorization', `Basic ${basicAuth}`)
        .set('Content-Type', 'multipart/form-data')
        .attach('file', fs.readFileSync(filePath), 'test.xml')

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array')
    })

    it('Should return 400 Bad Request when an admin tries to create pending order with xml file without some items.', async () => {
      const basicAuth = Buffer.from(`${username}:${password}`).toString('base64')
      const filePath = path.join(__dirname, '../testWithError.xml')
      const res = await chai
        .request(app)
        .post('/api/file/upload')
        .set('Authorization', `Basic ${basicAuth}`)
        .set('Content-Type', 'multipart/form-data')
        .attach('file', fs.readFileSync(filePath), 'testWithError.xml')

      expect(res).to.have.status(400)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    })

    it('Should return 400 Bad Request when an admin tries to create pending order with invalid xml file.', async () => {
      const basicAuth = Buffer.from(`${username}:${password}`).toString('base64')
      const filePath = path.join(__dirname, '../testError.xml')
      const res = await chai
        .request(app)
        .post('/api/file/upload')
        .set('Authorization', `Basic ${basicAuth}`)
        .set('Content-Type', 'multipart/form-data')
        .attach('file', fs.readFileSync(filePath), 'testError.xml')

      expect(res).to.have.status(400)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    })

    it('should return 401 when a non-admin tries to upload a file', async () => {
      const res = await chai
        .request(app)
        .post('/api/file/upload')
        .set('Authorization', `Basic ${Buffer.from('nonadmin:password').toString('base64')}`)
        .attach('file', Buffer.from('test file content'), 'test.txt')

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Invalid Username or Password')
    })

    it('should return 401 when a admin tries to upload a file with wrong password', async () => {
      const res = await chai
        .request(app)
        .post('/api/file/upload')
        .set('Authorization', `Basic ${Buffer.from(`${username}:password`).toString('base64')}`)
        .attach('file', Buffer.from('test file content'), 'test.txt')

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Invalid Username or Password')
    })

    it('should return 401 when admin tries to upload a file with invalid auth type', async () => {
      const res = await chai
        .request(app)
        .post('/api/file/upload')
        .set('Authorization', 'Bearer testtoken')
        .attach('file', Buffer.from('test file content'), 'test.txt')

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Invalid Auth Type')
    })

    it('should return 404 Not Found when admin tries to upload a file without file', async () => {
      const res = await chai
        .request(app)
        .post('/api/file/upload')
        .set('Authorization', `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('No files uploaded.')
    })
  })
})
