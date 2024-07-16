import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  createAdminTestUser,
  createVerifiedCompany,
  createVerifiedUser,
  iversAtKreeDotKrPassword
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string

describe('Company in Product Access Control Group actions', () => {
  before(async () => {
    await createAdminTestUser()

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: iversAtKreeDotKrPassword } })

    tokenAdmin = resAdmin.body.token
  })

  after(async () => {

  })

  describe('Delete a company from a product access control group', () => {
    it('Should return 204 No Content when an administrator deletes a company from a product access control by id.', async () => {
      const resNewUser = await createVerifiedUser('user@companyproductaccesscontrol.com', '1234567890')

      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user@companyproductaccesscontrol.com', 'accesscontrol.com')

      const companyId = resNewCompany.id

      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Product Access Control Group Beta'
          }
        })
      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      const resCompanyInProductAccessControlGroup = await chai
        .request(app)
        .post(`/api/product-access-control-groups/${String(productAccessControlGroupId)}/companies`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyProductAccessControlGroup: {
            companyIds: [
              companyId
            ]
          }
        })

      const companyInProductAccessControlGroupId = resCompanyInProductAccessControlGroup.body.companyProductAccessControlGroup.added[0].id

      const res = await chai
        .request(app)
        .delete(`/api/company-product-access-control-groups/${String(companyInProductAccessControlGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 Not Found when an administrator deletes a company who does not exist from a product access control by id.', async () => {
      const resNewUser = await createVerifiedUser('user2@companyproductaccesscontrol.com', '1234567890')

      const userId = resNewUser.id

      const resNewCompany = await createVerifiedCompany(userId, true, null, 'Access Control', 'user2@companyproductaccesscontrol.com', 'accesscontrol.com')

      const companyId = resNewCompany.id

      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Product Access Control Group Beta'
          }
        })
      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      const resCompanyInProductAccessControlGroup = await chai
        .request(app)
        .post(`/api/product-access-control-groups/${String(productAccessControlGroupId)}/companies`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyProductAccessControlGroup: {
            companyIds: [
              companyId
            ]
          }
        })

      const companyInProductAccessControlGroupId = resCompanyInProductAccessControlGroup.body.companyProductAccessControlGroup.added[0].id

      await chai
        .request(app)
        .delete(`/api/company-product-access-control-groups/${String(companyInProductAccessControlGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
      const res = await chai
        .request(app)
        .delete(`/api/company-product-access-control-groups/${String(companyInProductAccessControlGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Company in Product Access Control Group not found')
    })
  })
})
