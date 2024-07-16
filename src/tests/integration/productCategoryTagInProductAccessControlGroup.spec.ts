import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  createAdminTestUser,
  iversAtKreeDotKrPassword
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string

describe('Product Category Tag in User Product Access Control Group actions', () => {
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

  describe('Delete a product category tag from a product access control group', () => {
    it('Should return 204 No Content when an administrator deletes a product category tag  from a product access control by id.', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'jackets'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'super admin',
            type: 'security'
          }
        })

      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Product Access Control Group Theta'
          }
        })
      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      const resProductCategoryTagInProductAccessControlGroup = await chai
        .request(app)
        .post(`/api/product-access-control-groups/${String(productAccessControlGroupId)}/product-category-tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTagProductAccessControlGroup: {
            productCategoryTagIds: [
              productCategoryTagId
            ]
          }
        })

      const productCategoryTagInProductAccessControlGroupId = resProductCategoryTagInProductAccessControlGroup.body.productCategoryTagProductAccessControlGroup.added[0].id

      const res = await chai
        .request(app)
        .delete(`/api/product-category-tag-product-access-control-groups/${String(productCategoryTagInProductAccessControlGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 Not Found when an administrator deletes a product category tag  who does not exist from a product access control by id.', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'jackets'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'super admin',
            type: 'security'
          }
        })

      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Product Access Control Group Theta 2'
          }
        })
      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      const resProductCategoryTagInProductAccessControlGroup = await chai
        .request(app)
        .post(`/api/product-access-control-groups/${String(productAccessControlGroupId)}/product-category-tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTagProductAccessControlGroup: {
            productCategoryTagIds: [
              productCategoryTagId
            ]
          }
        })

      const productCategoryTagInProductAccessControlGroupId = resProductCategoryTagInProductAccessControlGroup.body.productCategoryTagProductAccessControlGroup.added[0].id

      await chai
        .request(app)
        .delete(`/api/product-category-tag-product-access-control-groups/${String(productCategoryTagInProductAccessControlGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
      const res = await chai
        .request(app)
        .delete(`/api/product-category-tag-product-access-control-groups/${String(productCategoryTagInProductAccessControlGroupId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Product Category Tag in Product Access Control Group not found')
    })
  })
})
