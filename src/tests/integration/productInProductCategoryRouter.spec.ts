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

describe('Product in Product Category actions', () => {
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

  describe('Delete a product from a product category', () => {
    it('Should return 204 No Content when an administrator deletes a product from a product category by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Bitter Lemonada',
            jfsku: 'JB12371',
            merchantSku: '1237104',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'Test Product Category'
          }
        })
      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductInProductCategory = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [
              productId
            ]
          }
        })

      const productInProductCategoryId = resProductInProductCategory.body.productProductCategory[0].id

      const res = await chai
        .request(app)
        .delete(`/api/product-product-categories/${String(productInProductCategoryId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 Not Found when an administrator deletes a product that does not exist from a product category by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Bitter Lemonada 2',
            jfsku: 'JB123712',
            merchantSku: '12371042',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'Test Product Category 2'
          }
        })
      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductInProductCategory = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [
              productId
            ]
          }
        })

      const productInProductCategoryId = resProductInProductCategory.body.productProductCategory[0].id

      await chai
        .request(app)
        .delete(`/api/product-product-categories/${String(productInProductCategoryId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
      const res = await chai
        .request(app)
        .delete(`/api/product-product-categories/${String(productInProductCategoryId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Product in Product Category not found')
    })
  })
})
