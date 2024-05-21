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

describe('Company User Group in Product Access Control Group actions', () => {
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

  describe('Delete a company user group from a product access control group', () => {
    it('Should return 204 No Content when an administrator deletes a company user group from a product access control group by id.', async () => {
      const resNewUser = await createVerifiedUser('user1@accesscontrolcompanyusergroup.com', '1234567890')
      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user1@accesscontrolcompanyusergroup.com', 'accesscontrol.com')
      const companyId = resNewCompany.id

      const resNewCompanyUserGroup = await chai
        .request(app)
        .post('/api/company-user-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroup: {
            name: 'Test Company User Group',
            companyId
          }
        })
      const companyUserGroupId = resNewCompanyUserGroup.body.companyUserGroup.id

      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Fourteen'
          }
        })
      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      const resCompanyUserGroupInProductAccessControlGroup = await chai
        .request(app)
        .post(`/api/product-access-control-groups/${String(productAccessControlGroupId)}/company-user-groups`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroupProductAccessControlGroup: {
            companyUserGroupIds: [
              companyUserGroupId
            ]
          }
        })

      const companyUserGroupInProductAccessControlGroupId = resCompanyUserGroupInProductAccessControlGroup.body.companyUserGroupProductAccessControlGroup.added[0].id

      const res = await chai
        .request(app)
        .delete(`/api/company-user-groups-product-access-control-groups/${String(companyUserGroupInProductAccessControlGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 Not Found when an administrator deletes a company user group from a product access control group by id.', async () => {
      const resNewUser = await createVerifiedUser('user2@accesscontrolcompanyusergroup.com', '1234567890')
      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user2@accesscontrolcompanyusergroup.com', 'accesscontrol.com')
      const companyId = resNewCompany.id

      const resNewCompanyUserGroup = await chai
        .request(app)
        .post('/api/company-user-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroup: {
            name: 'Test Company User Group',
            companyId
          }
        })
      const companyUserGroupId = resNewCompanyUserGroup.body.companyUserGroup.id

      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Fourteen'
          }
        })
      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      const resCompanyUserGroupInProductAccessControlGroup = await chai
        .request(app)
        .post(`/api/product-access-control-groups/${String(productAccessControlGroupId)}/company-user-groups`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroupProductAccessControlGroup: {
            companyUserGroupIds: [
              companyUserGroupId
            ]
          }
        })

      const companyUserGroupInProductAccessControlGroupId = resCompanyUserGroupInProductAccessControlGroup.body.companyUserGroupProductAccessControlGroup.added[0].id

      await chai
        .request(app)
        .delete(`/api/company-user-groups-product-access-control-groups/${String(companyUserGroupInProductAccessControlGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
      const res = await chai
        .request(app)
        .delete(`/api/company-user-groups-product-access-control-groups/${String(companyUserGroupInProductAccessControlGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Company User Group in Product Access Control Group not found')
    })
  })
})
