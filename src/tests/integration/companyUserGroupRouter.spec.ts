import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  createVerifiedUser,
  createVerifiedCompany
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string

describe('Product Access Control Group actions', () => {
  before(async () => {
    await createAdminTestUser()

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

    tokenAdmin = resAdmin.body.token
    token = resUser.body.token
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Get all company user groups', () => {
    it('Should return 200 Success when an admin successfully retrieves all company user groups.', async () => {
      const resNewUser = await createVerifiedUser('user1@accesscontrolusergroup.com', '1234567890')
      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user1@accesscontrolusergroup.com', 'accesscontrolusergroup.com')
      const companyId = resNewCompany.id

      await chai
        .request(app)
        .post('/api/company-user-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroup: {
            name: 'Test Company User Group One',
            companyId
          }
        })

      const res = await chai
        .request(app)
        .get('/api/company-user-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companyUserGroups')
      expect(res.body.companyUserGroups).to.be.an('array').lengthOf.above(0)
    })
  })

  describe('Create a company user group', () => {
    it('Should return 201 Created when an admin creates a company user group.', async () => {
      const resNewUser = await createVerifiedUser('user2@accesscontrolusergroup.com', '1234567890')
      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user2@accesscontrolusergroup.com', 'accesscontrolusergroup.com')
      const companyId = resNewCompany.id

      const res = await chai
        .request(app)
        .post('/api/company-user-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroup: {
            name: 'Test Company Prime User Group',
            companyId
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'companyUserGroup')
      expect(res.body.companyUserGroup).to.be.an('object')
      expect(res.body.companyUserGroup).to.include.keys('id', 'name', 'description', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a admin creates the same product access control group.', async () => {
      const resNewUser = await createVerifiedUser('user3@accesscontrolusergroup.com', '1234567890')
      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user3@accesscontrolusergroup.com', 'accesscontrolusergroup.com')
      const companyId = resNewCompany.id

      await chai
        .request(app)
        .post('/api/company-user-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroup: {
            name: 'Test Company Prime User Group One',
            companyId
          }
        })
      const res = await chai
        .request(app)
        .post('/api/company-user-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroup: {
            name: 'Test Company Prime User Group One',
            companyId
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companyUserGroup')
      expect(res.body.companyUserGroup).to.be.an('object')
      expect(res.body.companyUserGroup).to.include.keys('id', 'name', 'description', 'createdAt', 'updatedAt')
    })

    it('Should return 404 when a admin tries to create a user group with a company that does not exist.', async () => {
      const res = await chai
        .request(app)
        .post('/api/company-user-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroup: {
            name: 'Test Company Prime User Group Five',
            companyId: '88D48647-ED1C-49CF-9D53-403D7DAD8DB7'
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Company not found')
    })
  })

  describe('Get, update and delete a company user group', () => {
    it('Should return 200 OK when an admin gets a company user group by id.', async () => {
      const resNewUser = await createVerifiedUser('user5@accesscontrolusergroup.com', '1234567890')
      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user5@accesscontrolusergroup.com', 'accesscontrolusergroup.com')
      const companyId = resNewCompany.id
      const resCompanyUserGroup = await chai
        .request(app)
        .post('/api/company-user-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroup: {
            name: 'Test Company Prime User Group Six',
            companyId
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/company-user-groups/${String(resCompanyUserGroup.body.companyUserGroup.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companyUserGroup')
      expect(res.body.companyUserGroup).to.be.an('object')
      expect(res.body.companyUserGroup).to.include.keys('id', 'name', 'description', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a company user group by id.', async () => {
      const resNewUser = await createVerifiedUser('user6@accesscontrolusergroup.com', '1234567890')
      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user6@accesscontrolusergroup.com', 'accesscontrolusergroup.com')
      const companyId = resNewCompany.id
      const resCompanyUserGroup = await chai
        .request(app)
        .post('/api/company-user-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroup: {
            name: 'Test Company Prime User Group Seven',
            companyId
          }
        })

      const res = await chai
        .request(app)
        .put(`/api/company-user-groups/${String(resCompanyUserGroup.body.companyUserGroup.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroup: {
            name: 'Test Company Prime User Group Seven Updated'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companyUserGroup')
      expect(res.body.companyUserGroup).to.be.an('object')
      expect(res.body.companyUserGroup).to.include.keys('id', 'name', 'description', 'createdAt', 'updatedAt')
      expect(res.body.companyUserGroup.name).to.equal('Test Company Prime User Group Seven Updated')
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a company user group by id.', async () => {
      const resNewUser = await createVerifiedUser('user7@accesscontrolusergroup.com', '1234567890')
      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user7@accesscontrolusergroup.com', 'accesscontrolusergroup.com')
      const companyId = resNewCompany.id
      const resCompanyUserGroup = await chai
        .request(app)
        .post('/api/company-user-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroup: {
            name: 'Test Company Prime User Group Eight',
            companyId
          }
        })

      const res = await chai
        .request(app)
        .put(`/api/company-user-groups/${String(resCompanyUserGroup.body.companyUserGroup.id)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          companyUserGroup: {
            name: 'Test Company Prime User Group Eight Updated',
            companyId
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 204 when a admin deletes a company user group.', async () => {
      const resNewUser = await createVerifiedUser('user4@accesscontrolusergroup.com', '1234567890')
      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user4@accesscontrolusergroup.com', 'accesscontrolusergroup.com')
      const companyId = resNewCompany.id
      const resCompanyUserGroup = await chai
        .request(app)
        .post('/api/company-user-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroup: {
            name: 'Test Company Prime User Group Four',
            companyId
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/company-user-groups/${String(resCompanyUserGroup.body.companyUserGroup.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a company user group that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/company-user-groups/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Company User Group not found')
    })

    it('Should return 403 Forbidden when an non-administrator tries to delete a company user group by id.', async () => {
      const resNewUser = await createVerifiedUser('user8@accesscontrolusergroup.com', '1234567890')
      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user8@accesscontrolusergroup.com', 'accesscontrolusergroup.com')
      const companyId = resNewCompany.id
      const resCompanyUserGroup = await chai
        .request(app)
        .post('/api/company-user-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroup: {
            name: 'Test Company Prime User Group Fourty',
            companyId
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/company-user-groups/${String(resCompanyUserGroup.body.companyUserGroup.id)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })

  describe('User in Company User Group Router', () => {
    it('Should return 200 when an admin adds a user to a company user group', async () => {
      const resNewUser = await createVerifiedUser('user54@accesscontrolusergroup54.com', '1234567890')
      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user54@accesscontrolusergroup54.com', 'accesscontrolusergroup.com')
      const companyId = resNewCompany.id
      const resCompanyUserGroup = await chai
        .request(app)
        .post('/api/company-user-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroup: {
            name: 'Test Company Prime User Group Forty Four',
            companyId
          }
        })

      const companyUserGroupId = String(resCompanyUserGroup.body.companyUserGroup.id)

      const res = await chai
        .request(app)
        .post(`/api/company-user-groups/${companyUserGroupId}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          userCompanyUserGroup: {
            userIds: [userId]
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'userCompanyUserGroup')
      expect(res.body.userCompanyUserGroup).to.be.an('object')
      expect(res.body.userCompanyUserGroup).to.include.keys('updated', 'added')
      expect(res.body.userCompanyUserGroup.added).to.be.an('array').lengthOf(1)
      expect(res.body.userCompanyUserGroup.updated).to.be.an('array').lengthOf(0)
    })

    it('Should return 200 when an admin adds an existent user to a company user group', async () => {
      const resNewUser = await createVerifiedUser('user55@accesscontrolusergroup55.com', '1234567890')
      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user55@accesscontrolusergroup55.com', 'accesscontrolusergroup.com')
      const companyId = resNewCompany.id
      const resCompanyUserGroup = await chai
        .request(app)
        .post('/api/company-user-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroup: {
            name: 'Test Company Prime User Group Forty Four',
            companyId
          }
        })

      const companyUserGroupId = String(resCompanyUserGroup.body.companyUserGroup.id)

      await chai
        .request(app)
        .post(`/api/company-user-groups/${companyUserGroupId}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          userCompanyUserGroup: {
            userIds: [userId]
          }
        })
      const res = await chai
        .request(app)
        .post(`/api/company-user-groups/${companyUserGroupId}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          userCompanyUserGroup: {
            userIds: [userId]
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'userCompanyUserGroup')
      expect(res.body.userCompanyUserGroup).to.be.an('object')
      expect(res.body.userCompanyUserGroup).to.include.keys('updated', 'added')
      expect(res.body.userCompanyUserGroup.added).to.be.an('array').lengthOf(0)
      expect(res.body.userCompanyUserGroup.updated).to.be.an('array').lengthOf(1)
    })
  })
})
