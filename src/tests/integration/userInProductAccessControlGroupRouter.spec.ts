import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  createAdminTestUser,
  createVerifiedUser
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string

describe('User in Product Access Control Group actions', () => {
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

  describe('Delete a user from a product access control group', () => {
    it('Should return 204 No Content when an administrator deletes a user from a product access control by id.', async () => {
      const resNewUser = await createVerifiedUser('user@userproductaccesscontrolgroup.com', '1234567890')

      const userId = resNewUser.id

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

      const resUserInProductAccessControlGroup = await chai
        .request(app)
        .post(`/api/product-access-control-groups/${String(productAccessControlGroupId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          userProductAccessControlGroup: {
            userIds: [
              userId
            ]
          }
        })

      const userInProductAccessControlGroupId = resUserInProductAccessControlGroup.body.userProductAccessControlGroup.added[0].id

      const res = await chai
        .request(app)
        .delete(`/api/user-product-access-control-groups/${String(userInProductAccessControlGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 Not Found when an administrator deletes a user who does not exist from a product access control by id.', async () => {
      const resNewUser = await createVerifiedUser('user2@userproductaccesscontrolgroup.com', '1234567890')

      const userId = resNewUser.id

      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Product Access Control Group Beta Two'
          }
        })
      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      const resUserInProductAccessControlGroup = await chai
        .request(app)
        .post(`/api/product-access-control-groups/${String(productAccessControlGroupId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          userProductAccessControlGroup: {
            userIds: [
              userId
            ]
          }
        })

      const userInProductAccessControlGroupId = resUserInProductAccessControlGroup.body.userProductAccessControlGroup.added[0].id

      await chai
        .request(app)
        .delete(`/api/user-product-access-control-groups/${String(userInProductAccessControlGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
      const res = await chai
        .request(app)
        .delete(`/api/user-product-access-control-groups/${String(userInProductAccessControlGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('User in Product Access Control Group not found')
    })
  })
})
