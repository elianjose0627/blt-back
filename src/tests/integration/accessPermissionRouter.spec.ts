import chai from 'chai'
import chaiHttp from 'chai-http'
import { v4 as uuidv4 } from 'uuid'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  createVerifiedCompany
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let userId: string

describe('Access Permissions actions', () => {
  before(async () => {
    await createAdminTestUser()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustriesmarvel.com', phone: '254720123456', password: 'mackone' } })

    await verifyUser('shehulk@starkindustriesmarvel.com')

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: 'thebiggun' } })

    const resUser = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: 'mackone' } })

    tokenAdmin = resAdmin.body.token
    userId = resUser.body.user.id
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Create an access permission', () => {
    it('Should return 201 Created when an admin creates a access permission.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id
      const res = await chai
        .request(app)
        .post('/api/access-permissions')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          accessPermission: {
            name: 'Company Permission',
            module: 'companies',
            role: 'CampaignManager',
            permission: 'read',
            companyId
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'accessPermission')
      expect(res.body.accessPermission).to.be.an('object')
      expect(res.body.accessPermission).to.include.keys('id', 'name', 'role', 'module', 'permission', 'isEnabled', 'createdAt', 'updatedAt')
    })

    it('Should return 404 Not Found when an admin tries to create an access permission with a non-existent company.', async () => {
      const res = await chai
        .request(app)
        .post('/api/access-permissions')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          accessPermission: {
            name: 'Company Permission',
            module: 'companies',
            role: 'CampaignManager',
            permission: 'read',
            companyId: uuidv4()
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Company not found')
    })
  })

  describe('Get all access permissions', () => {
    it('Should return 200 OK when an admin gets all access permissions.', async () => {
      const res = await chai
        .request(app)
        .get('/api/access-permissions')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'accessPermissions')
      expect(res.body.accessPermissions).to.be.an('array')
    })
  })
})
