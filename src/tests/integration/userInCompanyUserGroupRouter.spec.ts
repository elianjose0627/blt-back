import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  createAdminTestUser,
  createVerifiedUser,
  createVerifiedCompany
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string

describe('User in User Company Group actions', () => {
  before(async () => {
    await createAdminTestUser()

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: 'thebiggun' } })

    tokenAdmin = resAdmin.body.token
  })

  after(async () => {

  })

  describe('Delete a user from a company user group', () => {
    it('Should return 204 No Content when an administrator deletes a user from a user group by id.', async () => {
      const resNewUser = await createVerifiedUser('user44@accesscontrolusergroup4.com', '1234567890')
      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user44@accesscontrolusergroup4.com', 'accesscontrolusergroup.com')
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

      const resUserInCompanyUserGroup = await chai
        .request(app)
        .post(`/api/company-user-groups/${companyUserGroupId}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          userCompanyUserGroup: {
            userIds: [userId]
          }
        })

      const userInCompanyUserGroupId = resUserInCompanyUserGroup.body.userCompanyUserGroup.added[0].id

      const res = await chai
        .request(app)
        .delete(`/api/user-company-user-groups/${String(userInCompanyUserGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 Not Found when an administrator deletes a user who does not exist from a user group by id.', async () => {
      const resNewUser = await createVerifiedUser('user45@accesscontrolusergroup4.com', '1234567890')
      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user45@accesscontrolusergroup4.com', 'accesscontrolusergroup.com')
      const companyId = resNewCompany.id
      const resCompanyUserGroup = await chai
        .request(app)
        .post('/api/company-user-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroup: {
            name: 'Test Company Prime User Group Forty Five',
            companyId
          }
        })

      const companyUserGroupId = String(resCompanyUserGroup.body.companyUserGroup.id)

      const resUserInCompanyUserGroup = await chai
        .request(app)
        .post(`/api/company-user-groups/${companyUserGroupId}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          userCompanyUserGroup: {
            userIds: [userId]
          }
        })

      const userInCompanyUserGroupId = resUserInCompanyUserGroup.body.userCompanyUserGroup.added[0].id

      await chai
        .request(app)
        .delete(`/api/user-company-user-groups/${String(userInCompanyUserGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
      const res = await chai
        .request(app)
        .delete(`/api/user-company-user-groups/${String(userInCompanyUserGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('User in Company User Group not found')
    })
  })
})
