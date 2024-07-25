import chai from 'chai'
import chaiHttp from 'chai-http'
import { v1 as uuidv1 } from 'uuid'
import { faker } from '@faker-js/faker'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  verifyCompanyDomain,
  createCompanyAdministratorWithCompany,
  createCampaignManager,
  createVerifiedUser,
  deleteCompanyFromProductAccessControlGroup,
  deleteCompanyUserGroupFromProductAccessControlGroup,
  deleteCompanyUserGroup,
  deleteUserCompanyUserGroup,
  iversAtKreeDotKrPassword,
  sheHulkAtStarkIndustriesPassword
} from '../utils'
import { IProduct } from '../../types'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string
let tokenCompanyAdminTwo: string
let tokenCampaignManager: string
let companyProductAccessControlGroupId: string
let companyUserGroupProductAccessControlGroupId: string
let companyUserGroupId2: string
let userCompanyUserGroupId: string
const campaignManagerPassword = faker.internet.password()
const companyAdministratorWithCompanyPassword = faker.internet.password()

describe('Product actions', () => {
  before(async () => {
    await createAdminTestUser()
    await createCompanyAdministratorWithCompany('minerva@kreeproducts.kr', companyAdministratorWithCompanyPassword)
    await createCampaignManager('ronan@kreeproducts.kr', campaignManagerPassword)

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustriesmarvel.com', phone: '254720123456', password: sheHulkAtStarkIndustriesPassword } })

    await verifyUser('shehulk@starkindustriesmarvel.com')

    const resUser = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: sheHulkAtStarkIndustriesPassword } })

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: iversAtKreeDotKrPassword } })

    const resCompanyAdminTwo = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'minerva@kreeproducts.kr', password: companyAdministratorWithCompanyPassword } })

    const resCampaignManager = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ronan@kreeproducts.kr', password: campaignManagerPassword } })

    tokenAdmin = resAdmin.body.token
    token = resUser.body.token
    tokenCompanyAdminTwo = resCompanyAdminTwo.body.token
    tokenCampaignManager = resCampaignManager.body.token
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
    await deleteCompanyFromProductAccessControlGroup(companyProductAccessControlGroupId)
    await deleteCompanyUserGroupFromProductAccessControlGroup(companyUserGroupProductAccessControlGroupId)
    await deleteUserCompanyUserGroup(userCompanyUserGroupId)
    await deleteCompanyUserGroup(companyUserGroupId2)
  })

  describe('Get all products', () => {
    it('Should return 200 Success when an admin successfully retrieves all products.', async () => {
      const res = await chai
        .request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array')
    })

    it('Should return 200 Success when an admin successfully retrieves all products with params.', async () => {
      const res = await chai
        .request(app)
        .get('/api/products')
        .query({
          limit: 10,
          page: 1,
          search: '123',
          filter: {
            isParent: 'false'
          },
          orderBy: {
            createdAt: 'asc',
            name: 'asc',
            price: 'asc'
          }
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array')
    })

    it('Should return 200 Success when an admin successfully retrieves all products excluding children.', async () => {
      const resProductParent = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Phone 1',
            jfsku: '1231ph1',
            merchantSku: '1231ph1',
            type: 'generic',
            productGroup: 'technology',
            isParent: true
          }
        })
      const parentProductId = String(resProductParent.body.product.id)
      const resProductChild = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Phone 2',
            jfsku: '1231ph2',
            merchantSku: '1231ph2',
            type: 'generic',
            productGroup: 'technology',
            minimumOrderQuantity: 2
          }
        })
      const childProductId = String(resProductChild.body.product.id)
      await chai
        .request(app)
        .patch(`/api/products/${childProductId}/child`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            parentId: parentProductId
          }
        })
      const res = await chai
        .request(app)
        .get('/api/products')
        .query({
          limit: 10,
          page: 1,
          search: 'Phone',
          filter: {
            showChildren: 'false'
          },
          select: 'type, description'
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(1)
      expect(res.body.products[0]).to.not.include.keys('jfsku', 'merchantSku', 'productGroup', 'pictures', 'isVisible', 'isParent',
        'recommendedNetSalePrice', 'shippingWeight', 'weight', 'barcode',
        'upc', 'taric', 'originCountry', 'bestBeforeDate',
        'serialNumberTracking', 'width', 'height', 'length')
    })

    it('Should return 200 Success when an admin successfully retrieves all products with category params.', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'technology'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'HP Pro',
            jfsku: '1231pc',
            merchantSku: '1231pc',
            type: 'generic',
            productGroup: 'technology'
          }
        })
      const productId = resProduct.body.product.id

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })
      const res = await chai
        .request(app)
        .get('/api/products')
        .query({
          limit: 10,
          page: 1,
          filter: {
            category: 'technology'
          }
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf.above(0)
    })

    it('Should return 200 Success when an admin successfully retrieves all products with price params.', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'clothing'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Sweater',
            jfsku: '1231sw',
            merchantSku: '1231sw',
            type: 'generic',
            productGroup: 'clothing',
            netRetailPrice: {
              amount: 200,
              currency: 'EUR',
              discount: 0
            }
          }
        })

      const productId = resProduct.body.product.id

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })
      const res = await chai
        .request(app)
        .get('/api/products')
        .query({
          limit: 10,
          page: 1,
          filter: {
            minPrice: 150,
            maxPrice: 200
          }
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf.above(0)
      expect(res.body.meta.total).to.equal(1)
    })

    it('Should return 200 Success when an admin successfully retrieves all products with price range params.', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'clothing'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Sweater',
            jfsku: '1231sw',
            merchantSku: '1231sw',
            type: 'generic',
            productGroup: 'clothing',
            netRetailPrice: {
              amount: 710,
              currency: 'EUR',
              discount: 0
            }
          }
        })
      const productId = resProduct.body.product.id

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })
      const res = await chai
        .request(app)
        .get('/api/products')
        .query({
          limit: 10,
          page: 1,
          filter: {
            price: '700-710'
          }
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(1)
      expect(res.body.meta.total).to.equal(1)
    })

    it('Should return 200 Success when an admin successfully retrieves all products with properties params.', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'shoes'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductColor = await chai
        .request(app)
        .post('/api/product-colors')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productColor: {
            name: 'black',
            hexCode: '#000000'
          }
        })

      const productColorId = resProductColor.body.productColor.id

      const resProductMaterial = await chai
        .request(app)
        .post('/api/product-materials')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productMaterial: {
            name: 'suede-blue'
          }
        })

      const productMaterialId = resProductMaterial.body.productMaterial.id

      const resProductSize = await chai
        .request(app)
        .post('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productSize: {
            name: '46'
          }
        })

      const productSizeId = resProductSize.body.productSize.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Boots',
            jfsku: '1231bt',
            merchantSku: '1231bt',
            type: 'generic',
            productGroup: 'shoes',
            productColorId,
            productMaterialId,
            productSizeId
          }
        })

      const productId = resProduct.body.product.id

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })
      const res = await chai
        .request(app)
        .get('/api/products')
        .query({
          limit: 10,
          page: 1,
          filter: {
            color: 'black',
            material: 'suede-blue',
            size: '46'
          }
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf.above(0)
      expect(res.body.meta.total).to.equal(1)
    })

    it('Should return 200 Success when an admin successfully retrieves all products with tags params.', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'phones'
          }
        })

      const productCategoryId = String(resProductCategory.body.productCategory.id)
      const resProductCategoryTag1 = await chai
        .request(app)
        .post(`/api/product-categories/${productCategoryId}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'samsung'
          }
        })

      const productCategoryTag1Id = resProductCategoryTag1.body.productCategoryTag.id
      const resProductCategoryTag2 = await chai
        .request(app)
        .post(`/api/product-categories/${productCategoryId}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: '5G'
          }
        })

      const productCategoryTag2Id = resProductCategoryTag2.body.productCategoryTag.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Samsung Galaxy S22',
            jfsku: '1231ph',
            merchantSku: '1231ph',
            type: 'generic',
            productGroup: 'phones'
          }
        })

      const productId = String(resProduct.body.product.id)

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      await chai
        .request(app)
        .post(`/api/products/${productId}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTag1Id, productCategoryTag2Id]
          }
        })
      const res = await chai
        .request(app)
        .get('/api/products')
        .query({
          limit: 10,
          page: 1,
          filter: {
            tags: `${String(productCategoryTag1Id)},${String(productCategoryTag2Id)}`
          }
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf.above(0)
      expect(res.body.meta.total).to.equal(1)
    })

    it('Should return 422 Unprocessable Entity when an admin tries to retrieve all products with disallowed select options.', async () => {
      const res = await chai
        .request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .query({
          select: 'type1'
        })

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.be.equal(false)
      expect(res.body.errors.message).to.equal('A validation error has occured')
    })

    it('Should return 403 when a non-admin retrieves all products.', async () => {
      const res = await chai
        .request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })

  describe('Create a product', () => {
    it('Should return 201 Created when an admin creates a product.', async () => {
      const res = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '1237',
            merchantSku: '1237',
            type: 'generic',
            productGroup: 'beverage',
            minimumOrderQuantity: 10
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an admin user creates the same product.', async () => {
      const res = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '1237',
            merchantSku: '1237',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
    })

    it('Should return 404 Not Found when an admin user tries to create a product on behalf of a company that does not exist.', async () => {
      const res = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            companyId: uuidv1(),
            name: 'Soda Water',
            jfsku: '12371',
            merchantSku: '12371',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Company not found')
    })

    it('Should return 201 Created when an admin user creates a product on behalf of a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company12379products.com'
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(companyId)
      const res = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            companyId,
            name: 'Soda Water',
            jfsku: '12379',
            merchantSku: '12379',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
    })

    it('Should return 204 when a admin deletes a product.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '123123',
            merchantSku: '123123',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/products/${String(resProduct.body.product.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a product that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/products/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Product not found')
    })
  })

  describe('Get, update and delete a product', () => {
    it('Should return 200 OK when an owner gets a product by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const res = await chai
        .request(app)
        .get(`/api/products/${String(productId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a company admin gets a product by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Cost Center Company 1',
            email: 'ivers2@kreeproducts.kr',
            domain: 'kreeproducts.kr'
          }
        })

      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(companyId)

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            companyId,
            name: 'Soda Water',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'minerva@kreeproducts.kr',
            actionType: 'add'
          }
        })

      const resCompanyAdmin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'minerva@kreeproducts.kr', password: companyAdministratorWithCompanyPassword } })

      tokenCompanyAdminTwo = resCompanyAdmin.body.token

      const res = await chai
        .request(app)
        .get(`/api/products/${String(productId)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a campaign manager gets a product by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Cost Center Company 1',
            email: 'ivers21@kreeproducts.kr',
            domain: 'kreeproducts.kr'
          }
        })

      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(companyId)

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            companyId,
            name: 'Soda Water',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'ronan@kreeproducts.kr',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ronan@kreeproducts.kr', password: campaignManagerPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .get(`/api/products/${String(productId)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.success).to.equal(true)
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator gets a product by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const res = await chai
        .request(app)
        .get(`/api/products/${String(productId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an owner gets a product by id that is a jfsku.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: 'VZ9N0169YEV',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.jfsku

      const res = await chai
        .request(app)
        .get(`/api/products/${String(productId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
    })

    it('Should return 422 Unprocessable entity when an administrator gets a product using an invalid id.', async () => {
      const res = await chai
        .request(app)
        .get('/api/products/123')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('A validation error has occured')
    })

    it('Should return 200 OK when an administrator updates a product by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const res = await chai
        .request(app)
        .put(`/api/products/${String(productId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water Fresh',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
      expect(res.body.product.name).to.equal('Soda Water Fresh')
    })

    it('Should return 200 OK when an administrator updates a product by id with a category.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '1231',
            merchantSku: '1231',
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
            name: 'Beverage'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      const res = await chai
        .request(app)
        .put(`/api/products/${String(productId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water Fresh',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt', 'company', 'productCategories')
      expect(res.body.product.name).to.equal('Soda Water Fresh')
    })

    it('Should return 403 Forbidden when an non-employee, non-admin, non-owner tries to update a product by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water Fresh',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const res = await chai
        .request(app)
        .put(`/api/products/${String(productId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          product: {
            name: 'Soda Water Fresh Mix',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, admin or employee can perform this action')
    })

    it('Should return 200 OK when an administrator deletes a product by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water Fresh',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const res = await chai
        .request(app)
        .delete(`/api/products/${String(productId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when an non-employee, non-admin, non-owner tries to delete a product by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water Fresh',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const res = await chai
        .request(app)
        .delete(`/api/products/${String(productId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, admin or employee can perform this action')
    })
  })

  describe('Update the company of a product', () => {
    it('Should return 200 OK when an administrator updates the company of a product by id.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company1237products1237.com'
          }
        })

      const companyId = String(resCompany.body.company.id)

      const res = await chai
        .request(app)
        .patch(`/api/products/${String(productId)}/company`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            companyId
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates the company of a product by id with null.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '1231',
            merchantSku: '1231',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const res = await chai
        .request(app)
        .patch(`/api/products/${String(productId)}/company`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            companyId: null
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
    })

    it('Should return 404 Not Found when an admin user tries to create a product on behalf of a company that does not exist.', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '12371',
            merchantSku: '12371',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const res = await chai
        .request(app)
        .patch(`/api/products/${String(productId)}/company`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            companyId: uuidv1()
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Company not found')
    })
  })

  describe('Get outbounds of a product', () => {
    it('Should return 200 OK when an admin gets outbounds of a product', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: 'J12371',
            merchantSku: '12371',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const res = await chai
        .request(app)
        .get(`/api/products/${String(productId)}/outbounds`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'outbounds')
      expect(res.body.outbounds).to.be.an('array')
    })
  })

  describe('Product Tags', () => {
    it('Should return 201 Created when an admin adds a tag to a product', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'kitchenware'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'silver'
          }
        })

      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: 'J12371',
            merchantSku: '12371',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagId]
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'productTags')
      expect(res.body.productTags).to.be.an('array')
    })

    it('Should return 200 OK when an admin adds the same tag to a product', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'technology'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'laptop'
          }
        })

      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Macbook Pro',
            jfsku: 'J34971',
            merchantSku: '42721',
            type: 'generic',
            productGroup: 'laptop'
          }
        })

      const productId = resProduct.body.product.id

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagId]
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagId]
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productTags')
      expect(res.body.productTags).to.be.an('array')
    })

    it('Should return 404 Not Found when an admin adds a tag that does not exist to a product', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'kitchenware'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: 'J12371',
            merchantSku: '12371',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [uuidv1()]
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.be.equal('Product Tag not found')
    })

    it('Should return 404 Not Found when an admin adds tags that does not exist to a product', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'kitchenware'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: 'J12371',
            merchantSku: '12371',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [uuidv1(), uuidv1()]
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.be.equal('Product Tags not found')
    })

    it('Should return 201 Created when an admim adds a tag that belongs to another category to the product', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'kitchenware'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'silver'
          }
        })

      const resProductCategoryTwo = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'clothing'
          }
        })

      const productCategoryIdTwo = resProductCategoryTwo.body.productCategory.id

      const resProductCategoryTagTwo = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryIdTwo)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'winter'
          }
        })

      const productCategoryTagIdTwo = resProductCategoryTagTwo.body.productCategoryTag.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: 'J12371',
            merchantSku: '12371',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagIdTwo]
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'productTags')
      expect(res.body.productTags).to.be.an('array').lengthOf.above(0)
    })

    it('Should return 204 No Content when an admin removes tags from a product', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'kitchenware'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'gold'
          }
        })

      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water Clean',
            jfsku: 'J12372',
            merchantSku: '12372',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagId]
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: []
          }
        })

      expect(res).to.have.status(204)
    })

    it('Should return 200 OK when an admin removes some tags from a product but adds a new one', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'agriculture'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'tractors'
          }
        })

      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const resProductCategoryTagTwo = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'fertilizers'
          }
        })

      const productCategoryTagIdTwo = resProductCategoryTagTwo.body.productCategoryTag.id

      const resProductCategoryTagThree = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'fertilizers'
          }
        })

      const productCategoryTagIdThree = resProductCategoryTagThree.body.productCategoryTag.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Mercedes truck',
            jfsku: 'J12312',
            merchantSku: '12312',
            type: 'generic',
            productGroup: 'machinery'
          }
        })

      const productId = resProduct.body.product.id

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagId, productCategoryTagIdTwo]
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagIdThree]
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productTags')
      expect(res.body.productTags).to.be.an('array')
    })
  })

  describe('Set product parent child relationship', () => {
    it('Should return 200 OK when an admin sets a product as a child.', async () => {
      const resProductParent = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Jumper',
            jfsku: 'j123',
            merchantSku: 'j123',
            type: 'generic',
            productGroup: 'clothing',
            isParent: true
          }
        })

      const productParentId = resProductParent.body.product.id

      const resProductChild = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Jumper - Red',
            jfsku: 'j124',
            merchantSku: 'j123-red',
            type: 'generic',
            productGroup: 'clothing'
          }
        })

      const productChildId = resProductChild.body.product.id

      const res = await chai
        .request(app)
        .patch(`/api/products/${String(productChildId)}/child`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            parentId: productParentId
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 404 Not Found when an admin tries to set a product as a child to a non-existent parent.', async () => {
      const resProductChild = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Jumper - Red',
            jfsku: 'j124',
            merchantSku: 'j123-red',
            type: 'generic',
            productGroup: 'clothing'
          }
        })

      const productChildId = resProductChild.body.product.id

      const res = await chai
        .request(app)
        .patch(`/api/products/${String(productChildId)}/child`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            parentId: uuidv1()
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('Parent product not found')
    })

    it('Should return 200 OK when an admin removes a product as a child.', async () => {
      const resProductParent = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Jumper',
            jfsku: 'j125',
            merchantSku: 'j125',
            type: 'generic',
            productGroup: 'clothing',
            isParent: true
          }
        })

      const productParentId = resProductParent.body.product.id

      const resProductChild = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Jumper - Red',
            jfsku: 'j125',
            merchantSku: 'j125-red',
            type: 'generic',
            productGroup: 'clothing'
          }
        })

      const productChildId = resProductChild.body.product.id

      await chai
        .request(app)
        .patch(`/api/products/${String(productChildId)}/child`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            parentId: productParentId
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/products/${String(productChildId)}/child`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an admin adds children to a product.', async () => {
      const resProductParent = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Shirt',
            jfsku: 'sh123',
            merchantSku: 'sh123',
            type: 'generic',
            productGroup: 'clothing',
            isParent: true
          }
        })

      const productParentId = resProductParent.body.product.id

      const resProductChild = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Shirt - Blue',
            jfsku: 'sh124',
            merchantSku: 'sh123-blue',
            type: 'generic',
            productGroup: 'clothing'
          }
        })

      const productChildId = resProductChild.body.product.id

      const res = await chai
        .request(app)
        .patch(`/api/products/${String(productParentId)}/children`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            childIds: [productChildId]
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('added', 'removed')
      expect(res.body.product.added.addedChildrenTotal).to.equal(1)
      expect(res.body.product.removed.removedChildrenTotal).to.equal(0)
    })

    it('Should return 200 OK when an admin removes children from a product.', async () => {
      const resProductParent = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Shirt',
            jfsku: 'sh123',
            merchantSku: 'sh123',
            type: 'generic',
            productGroup: 'clothing',
            isParent: true
          }
        })

      const productParentId = resProductParent.body.product.id

      const resProductChild = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Shirt - Blue',
            jfsku: 'sh124',
            merchantSku: 'sh123-blue',
            type: 'generic',
            productGroup: 'clothing'
          }
        })

      const productChildId = resProductChild.body.product.id

      await chai
        .request(app)
        .patch(`/api/products/${String(productParentId)}/children`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            childIds: [productChildId]
          }
        })

      const res = await chai
        .request(app)
        .patch(`/api/products/${String(productParentId)}/children`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            childIds: []
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('added', 'removed')
      expect(res.body.product.added.addedChildrenTotal).to.equal(0)
      expect(res.body.product.removed.removedChildrenTotal).to.equal(1)
    })

    it('Should return 404 Not Found when an admin tries to add children to a product that is not a parent.', async () => {
      const resProductChild = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Jumper - Red',
            jfsku: 'j124',
            merchantSku: 'j123-red',
            type: 'generic',
            productGroup: 'clothing'
          }
        })

      const productChildId = resProductChild.body.product.id

      const res = await chai
        .request(app)
        .patch(`/api/products/${String(productChildId)}/children`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            childIds: [uuidv1()]
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('Parent product not found')
    })
  })

  describe('Product Graduated Prices', () => {
    it('Should return 201 Created when an admin adds a graduated price to a product', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Bitter Lemon',
            jfsku: 'J1244371',
            merchantSku: '1234471',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const productId = resProduct.body.product.id

      const res = await chai
        .request(app)
        .post(`/api/products/${String(productId)}/graduated-prices`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productGraduatedPrice: {
            firstUnit: 1,
            lastUnit: 150,
            price: 15.12
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'productGraduatedPrice')
      expect(res.body.productGraduatedPrice).to.be.an('object')
    })

    it('Should return 200 OK when an admin adds the same graduated price to a product', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Macbook Pro M1',
            jfsku: 'J34971M1',
            merchantSku: '42721M1',
            type: 'generic',
            productGroup: 'laptop'
          }
        })

      const productId = resProduct.body.product.id

      await chai
        .request(app)
        .post(`/api/products/${String(productId)}/graduated-prices`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productGraduatedPrice: {
            firstUnit: 1,
            lastUnit: 100,
            price: 15.12
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/products/${String(productId)}/graduated-prices`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productGraduatedPrice: {
            firstUnit: 1,
            lastUnit: 100,
            price: 15.12
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productGraduatedPrice')
      expect(res.body.productGraduatedPrice).to.be.an('object')
    })
  })

  describe('Product Catalogue', () => {
    it('Should return 200 OK when an admin gets the product catalogue', async () => {
      await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Tractor',
            jfsku: '1231tr1',
            merchantSku: '1231tr1',
            type: 'generic',
            productGroup: 'technology'
          }
        })

      const res = await chai
        .request(app)
        .get('/api/products/catalogue')
        .query({
          limit: 10,
          page: 1,
          select: 'type, description'
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf.above(1)
      expect(res.body.products[0]).to.not.include.keys('jfsku', 'merchantSku', 'productGroup', 'pictures', 'isVisible', 'isParent',
        'recommendedNetSalePrice', 'shippingWeight', 'weight', 'barcode',
        'upc', 'taric', 'originCountry', 'bestBeforeDate',
        'serialNumberTracking', 'width', 'height', 'length')
    })

    it('Should return 200 OK when a user gets the product catalogue', async () => {
      const res = await chai
        .request(app)
        .get('/api/products/catalogue')
        .query({
          limit: 10,
          page: 1
        })
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(0)
    })

    it('Should return 200 OK when an employee gets the product catalogue', async () => {
      const randomPassword = faker.internet.password()
      await createVerifiedUser('ivers2@kreeprotectedproducts.kr', randomPassword)
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Protected Company',
            email: 'ivers2@kreeprotectedproducts.kr',
            domain: 'kreeprotectedproducts.kr'
          }
        })

      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(companyId)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'ivers2@kreeprotectedproducts.kr',
            actionType: 'add'
          }
        })

      const resEmployee = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ivers2@kreeprotectedproducts.kr', password: randomPassword } })

      const tokenEmployee = String(resEmployee.body.token)
      const res = await chai
        .request(app)
        .get('/api/products/catalogue')
        .query({
          limit: 10,
          page: 1
        })
        .set('Authorization', `Bearer ${tokenEmployee}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(0)
    })

    it('Should return 200 OK when a user in a product access control group gets the product catalogue', async () => {
      const randomPassword = faker.internet.password()
      await createVerifiedUser('ivers99@kreeprotectedproducts.kr', randomPassword)
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ivers99@kreeprotectedproducts.kr', password: randomPassword } })

      const tokenUser = String(resUser.body.token)
      const userId = String(resUser.body.user.id)

      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'technology'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'samsung'
          }
        })
      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Tractor',
            jfsku: '1231tr10',
            merchantSku: '1231tr10',
            type: 'generic',
            productGroup: 'technology'
          }
        })

      const productId = String(resProduct.body.product.id)

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagId]
          }
        })

      // Create a product access control group
      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group'
          }
        })

      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      // Add tag and user to the product access control group
      await chai
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
      await chai
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

      const res = await chai
        .request(app)
        .get('/api/products/catalogue')
        .query({
          limit: 10,
          page: 1
        })
        .set('Authorization', `Bearer ${tokenUser}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(1)
      expect(res.body.products[0].name).to.equal('Tractor')
    })

    it('Should return 200 OK when a user in a product access control group searches for an item in the product catalogue', async () => {
      const randomPassword = faker.internet.password()
      await createVerifiedUser('ivers919@kreeprotectedproducts.kr', randomPassword)
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ivers919@kreeprotectedproducts.kr', password: randomPassword } })

      const tokenUser = String(resUser.body.token)
      const userId = String(resUser.body.user.id)

      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'technology'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'nokia'
          }
        })
      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Nokia 3310',
            jfsku: '1231nk3310',
            merchantSku: '1231nk3310',
            type: 'generic',
            productGroup: 'technology'
          }
        })

      const productId = String(resProduct.body.product.id)

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagId]
          }
        })

      // Create a product access control group
      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Search'
          }
        })

      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      // Add tag and user to the product access control group
      await chai
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
      await chai
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

      const res = await chai
        .request(app)
        .get('/api/products/catalogue')
        .query({
          limit: 10,
          page: 1,
          search: 'Nokia 3310'
        })
        .set('Authorization', `Bearer ${tokenUser}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(1)
      expect(res.body.products[0].name).to.equal('Nokia 3310')
    })

    it('Should return 200 OK when a user in a product access control group filters by price in the product catalogue', async () => {
      const randomPassword = faker.internet.password()
      await createVerifiedUser('ivers9190@kreeprotectedproducts.kr', randomPassword)
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ivers9190@kreeprotectedproducts.kr', password: randomPassword } })

      const tokenUser = String(resUser.body.token)
      const userId = String(resUser.body.user.id)

      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'technology'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'oneplus'
          }
        })
      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'OnePlus Nord CE',
            jfsku: '1231opnce',
            merchantSku: '1231opnce',
            type: 'generic',
            productGroup: 'technology',
            netRetailPrice: {
              amount: 200,
              currency: 'EUR',
              discount: 0
            }
          }
        })

      const productId = String(resProduct.body.product.id)

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagId]
          }
        })

      // Create a product access control group
      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Price'
          }
        })

      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      // Add tag and user to the product access control group
      await chai
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
      await chai
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

      const res = await chai
        .request(app)
        .get('/api/products/catalogue')
        .query({
          limit: 10,
          page: 1,
          filter: {
            minPrice: 199,
            maxPrice: 200
          }
        })
        .set('Authorization', `Bearer ${tokenUser}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(1)
      expect(res.body.products[0].name).to.equal('OnePlus Nord CE')
    })

    it('Should return 200 OK when a user in a product access control group filters by price range in the product catalogue', async () => {
      const randomPassword = faker.internet.password()
      await createVerifiedUser('ivers9191@kreeprotectedproducts.kr', randomPassword)
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ivers9191@kreeprotectedproducts.kr', password: randomPassword } })

      const tokenUser = String(resUser.body.token)
      const userId = String(resUser.body.user.id)

      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'technology'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'lg'
          }
        })
      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'LG Fridge',
            jfsku: '1231lg',
            merchantSku: '1231lg',
            type: 'generic',
            productGroup: 'technology',
            netRetailPrice: {
              amount: 500,
              currency: 'EUR',
              discount: 0
            }
          }
        })

      const productId = String(resProduct.body.product.id)

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagId]
          }
        })

      // Create a product access control group
      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Price Range'
          }
        })

      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      // Add tag and user to the product access control group
      await chai
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
      await chai
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

      const res = await chai
        .request(app)
        .get('/api/products/catalogue')
        .query({
          limit: 10,
          page: 1,
          filter: {
            price: '400-500'
          }
        })
        .set('Authorization', `Bearer ${tokenUser}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(1)
      expect(res.body.products[0].name).to.equal('LG Fridge')
    })

    it('Should return 200 OK when a user in a product access control group filters by show children in the product catalogue', async () => {
      const randomPassword = faker.internet.password()
      await createVerifiedUser('ivers1990@kreeprotectedproducts.kr', randomPassword)
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ivers1990@kreeprotectedproducts.kr', password: randomPassword } })

      const tokenUser = String(resUser.body.token)
      const userId = String(resUser.body.user.id)

      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'technology'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'sony'
          }
        })
      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Sony Xperia',
            jfsku: '1231snxp',
            merchantSku: '1231snxp',
            type: 'generic',
            productGroup: 'technology',
            isParent: true,
            netRetailPrice: {
              amount: 500,
              currency: 'EUR',
              discount: 0
            }
          }
        })

      const productId = String(resProduct.body.product.id)

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      const resProductChild = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Sony Xperia 2',
            jfsku: '1231snxp2',
            merchantSku: '1231snxp2',
            type: 'generic',
            productGroup: 'technology',
            netRetailPrice: {
              amount: 500,
              currency: 'EUR',
              discount: 0
            }
          }
        })

      const productChildId = String(resProductChild.body.product.id)

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productChildId]
          }
        })

      await chai
        .request(app)
        .patch(`/api/products/${String(productId)}/children`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            childIds: [productChildId]
          }
        })

      await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagId]
          }
        })

      await chai
        .request(app)
        .post(`/api/products/${String(productChildId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagId]
          }
        })

      // Create a product access control group
      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Show Children'
          }
        })

      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      // Add tag and user to the product access control group
      await chai
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
      await chai
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

      const res = await chai
        .request(app)
        .get('/api/products/catalogue')
        .query({
          limit: 10,
          page: 1,
          filter: {
            showChildren: 'false'
          }
        })
        .set('Authorization', `Bearer ${tokenUser}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(1)
      expect(res.body.products[0].name).to.equal('Sony Xperia')
      expect(res.body.products[0].isParent).to.equal(true)
    })

    it('Should return 200 OK when an employee whose company is in a product access control group gets the product catalogue', async () => {
      const randomPassword = faker.internet.password()
      await createVerifiedUser('ivers88@kreeprotectedproducts.kr', randomPassword)
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Protected Company Three',
            email: 'ivers88@kreeprotectedproducts.kr',
            domain: 'kreeprotectedproducts.kr'
          }
        })

      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(companyId)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'ivers88@kreeprotectedproducts.kr',
            actionType: 'add'
          }
        })

      const resEmployee = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ivers88@kreeprotectedproducts.kr', password: randomPassword } })

      const tokenEmployee = String(resEmployee.body.token)

      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'technology'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'galaxy'
          }
        })
      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Galaxy Note',
            jfsku: '1231gxn1',
            merchantSku: '1231gxn1',
            type: 'generic',
            productGroup: 'technology'
          }
        })

      const productId = String(resProduct.body.product.id)

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagId]
          }
        })

      // Create a product access control group
      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Eighty Eight'
          }
        })

      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      // Add tag and company to the product access control group
      const resCompanyProductAccessControlGroup = await chai
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

      companyProductAccessControlGroupId = resCompanyProductAccessControlGroup.body.companyProductAccessControlGroup.added[0].id
      await chai
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

      const res = await chai
        .request(app)
        .get('/api/products/catalogue')
        .query({
          limit: 10,
          page: 1
        })
        .set('Authorization', `Bearer ${tokenEmployee}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(1)
      expect(res.body.products[0].name).to.equal('Galaxy Note')
    })

    it('Should return 200 OK when an employee in a company user group gets the product catalogue', async () => {
      const randomPassword = faker.internet.password()
      await createVerifiedUser('ivers8@kreeprotectedproducts.kr', randomPassword)
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Protected Company Two',
            email: 'ivers8@kreeprotectedproducts.kr',
            domain: 'kreeprotectedproducts.kr'
          }
        })

      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(companyId)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'ivers8@kreeprotectedproducts.kr',
            actionType: 'add'
          }
        })

      const resEmployee = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ivers8@kreeprotectedproducts.kr', password: randomPassword } })

      const tokenEmployee = String(resEmployee.body.token)
      const userId = String(resEmployee.body.user.id)

      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'technology'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'corby'
          }
        })
      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Samsung Corby',
            jfsku: '1231smcb1',
            merchantSku: '1231smcb1',
            type: 'generic',
            productGroup: 'technology'
          }
        })

      const productId = String(resProduct.body.product.id)

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagId]
          }
        })

      // Create a product access control group
      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Captain Marvel Protected Company Two Product Access Control Group'
          }
        })

      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      // Create a company user group and add employee
      const resCompanyUserGroup = await chai
        .request(app)
        .post('/api/company-user-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companyUserGroup: {
            name: 'Captain Marvel Protected Company Two User Group',
            companyId
          }
        })

      const companyUserGroupId = String(resCompanyUserGroup.body.companyUserGroup.id)
      companyUserGroupId2 = companyUserGroupId

      const resUserCompanyUserGroup = await chai
        .request(app)
        .post(`/api/company-user-groups/${companyUserGroupId}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          userCompanyUserGroup: {
            userIds: [userId]
          }
        })

      userCompanyUserGroupId = resUserCompanyUserGroup.body.userCompanyUserGroup.added[0].id

      // Add tag and user group to the product access control group
      const resCompanyUserGroupProductAccessControlGroup = await chai
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
      companyUserGroupProductAccessControlGroupId = resCompanyUserGroupProductAccessControlGroup.body.companyUserGroupProductAccessControlGroup.added[0].id
      await chai
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

      const res = await chai
        .request(app)
        .get('/api/products/catalogue')
        .query({
          limit: 10,
          page: 1
        })
        .set('Authorization', `Bearer ${tokenEmployee}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(1)
      expect(res.body.products[0].name).to.equal('Samsung Corby')
    })

    it('Should return 200 OK when a user in a product access control group gets a product in the catalogue', async () => {
      const randomPassword = faker.internet.password()
      await createVerifiedUser('ivers97@kreeprotectedproducts.kr', randomPassword)
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ivers97@kreeprotectedproducts.kr', password: randomPassword } })

      const tokenUser = String(resUser.body.token)
      const userId = String(resUser.body.user.id)

      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'technology'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'apple'
          }
        })
      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'iPhone',
            jfsku: '1231iph10',
            merchantSku: '1231iph10',
            type: 'generic',
            productGroup: 'technology'
          }
        })

      const productId = String(resProduct.body.product.id)

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagId]
          }
        })

      // Create a product access control group
      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Apple'
          }
        })

      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      // Add tag and user to the product access control group
      await chai
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
      await chai
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

      const res = await chai
        .request(app)
        .get(`/api/products/${productId}/catalogue`)
        .query({
          limit: 10,
          page: 1
        })
        .set('Authorization', `Bearer ${tokenUser}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product.name).to.equal('iPhone')
    })

    it('Should return 200 OK when a user in a product access control group gets similar product tags in the catalogue', async () => {
      const randomPassword = faker.internet.password()
      await createVerifiedUser('ivers917@kreeprotectedproducts.kr', randomPassword)
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ivers917@kreeprotectedproducts.kr', password: randomPassword } })

      const tokenUser = String(resUser.body.token)
      const userId = String(resUser.body.user.id)

      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'technology'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id

      const resProductCategoryTag = await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategoryTag: {
            name: 'watch'
          }
        })
      const productCategoryTagId = resProductCategoryTag.body.productCategoryTag.id

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Apple Smart Watch',
            jfsku: '1231isw10',
            merchantSku: '1231isw10',
            type: 'generic',
            productGroup: 'technology'
          }
        })
      const productId = String(resProduct.body.product.id)
      const resProduct2 = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Apple Smart Watch 2',
            jfsku: '1231isw102',
            merchantSku: '1231isw102',
            type: 'generic',
            productGroup: 'technology'
          }
        })

      const productId2 = String(resProduct2.body.product.id)

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId, productId2]
          }
        })

      await chai
        .request(app)
        .post(`/api/products/${String(productId)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagId]
          }
        })
      await chai
        .request(app)
        .post(`/api/products/${String(productId2)}/tags`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productTag: {
            productCategoryTagIds: [productCategoryTagId]
          }
        })

      // Create a product access control group
      const resProductAccessControlGroup = await chai
        .request(app)
        .post('/api/product-access-control-groups')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productAccessControlGroup: {
            name: 'Test Access Control Group Apple Watch'
          }
        })

      const productAccessControlGroupId = resProductAccessControlGroup.body.productAccessControlGroup.id

      // Add tag and user to the product access control group
      await chai
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
      await chai
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

      const res = await chai
        .request(app)
        .get(`/api/products/${productId}/catalogue/similar`)
        .query({
          limit: 10,
          page: 1
        })
        .set('Authorization', `Bearer ${tokenUser}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'meta', 'productTags')
      expect(res.body.productTags).to.be.an('array').lengthOf.above(0)
    })

    it('Should return 200 OK when admin gets similar product tags in the catalogue for an untagged product', async () => {
      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Apple Smart Watch 4',
            jfsku: '1231isw104',
            merchantSku: '1231isw104',
            type: 'generic',
            productGroup: 'technology'
          }
        })
      const productId = String(resProduct.body.product.id)

      const res = await chai
        .request(app)
        .get(`/api/products/${productId}/catalogue/similar`)
        .query({
          limit: 10,
          page: 1
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'meta', 'productTags')
      expect(res.body.productTags).to.be.an('array').lengthOf(0)
    })

    it('Should return 200 Success when an admin successfully retrieves all product variations for a parent.', async () => {
      const resProductParent = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Smart Watch 26',
            jfsku: '1231sw26',
            merchantSku: '1231sw26',
            type: 'generic',
            productGroup: 'technology',
            isParent: true
          }
        })
      const parentProductId = String(resProductParent.body.product.id)
      const resProductChild = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Smart Watch 26 2',
            jfsku: '1231sw262',
            merchantSku: '1231sw262',
            type: 'generic',
            productGroup: 'technology'
          }
        })
      const childProductId = String(resProductChild.body.product.id)
      await chai
        .request(app)
        .patch(`/api/products/${childProductId}/child`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            parentId: parentProductId
          }
        })
      const res = await chai
        .request(app)
        .get(`/api/products/${parentProductId}/catalogue/variations`)
        .query({
          limit: 10,
          page: 1
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(1)
    })

    it('Should return 200 Success when an admin successfully retrieves all product variations for a parent with filter set to true.', async () => {
      const resProductParent = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Smart Watch 27',
            jfsku: '1231sw27',
            merchantSku: '1231sw27',
            type: 'generic',
            productGroup: 'technology',
            isParent: true
          }
        })
      const parentProductId = String(resProductParent.body.product.id)
      const resProductChild = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Smart Watch 27 2',
            jfsku: '1231sw272',
            merchantSku: '1231sw272',
            type: 'generic',
            productGroup: 'technology'
          }
        })
      const childProductId = String(resProductChild.body.product.id)
      await chai
        .request(app)
        .patch(`/api/products/${childProductId}/child`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            parentId: parentProductId
          }
        })
      const res = await chai
        .request(app)
        .get(`/api/products/${parentProductId}/catalogue/variations`)
        .query({
          limit: 10,
          page: 1,
          filter: {
            showParent: 'true'
          }
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(2)
    })

    it('Should return 200 Success when an admin successfully retrieves all product variations for a child.', async () => {
      const resProductParent = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Smart Watch 26 3',
            jfsku: '1231sw263',
            merchantSku: '1231sw263',
            type: 'generic',
            productGroup: 'technology',
            isParent: true
          }
        })
      const parentProductId = String(resProductParent.body.product.id)
      const resProductChild = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Smart Watch 26 4',
            jfsku: '1231sw264',
            merchantSku: '1231sw264',
            type: 'generic',
            productGroup: 'technology'
          }
        })
      const childProductId = String(resProductChild.body.product.id)
      await chai
        .request(app)
        .patch(`/api/products/${childProductId}/child`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            parentId: parentProductId
          }
        })
      const res = await chai
        .request(app)
        .get(`/api/products/${childProductId}/catalogue/variations`)
        .query({
          limit: 10,
          page: 1
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(1)
    })

    it('Should return 200 Success when an admin successfully retrieves all product variations for a child with size filter.', async () => {
      const resProductSize = await chai
        .request(app)
        .post('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productSize: {
            name: '4xl'
          }
        })
      const resProductSize2 = await chai
        .request(app)
        .post('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productSize: {
            name: '5xl'
          }
        })

      const resProductParent = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Smart Watch 18 3',
            jfsku: '1231sw183',
            merchantSku: '1231sw183',
            type: 'generic',
            productGroup: 'technology',
            isParent: true
          }
        })
      const parentProductId = String(resProductParent.body.product.id)
      const resProductChild = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Smart Watch 18 4',
            jfsku: '1231sw184',
            merchantSku: '1231sw184',
            type: 'generic',
            productGroup: 'technology',
            productSizeId: resProductSize.body.productSize.id
          }
        })
      const resProductChild2 = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Smart Watch 18 5',
            jfsku: '1231sw185',
            merchantSku: '1231sw185',
            type: 'generic',
            productGroup: 'technology',
            productSizeId: resProductSize2.body.productSize.id
          }
        })
      const childProductId = String(resProductChild.body.product.id)
      const childProductId2 = String(resProductChild2.body.product.id)
      await chai
        .request(app)
        .patch(`/api/products/${childProductId}/child`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            parentId: parentProductId
          }
        })
      await chai
        .request(app)
        .patch(`/api/products/${childProductId2}/child`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            parentId: parentProductId
          }
        })
      const res = await chai
        .request(app)
        .get(`/api/products/${childProductId}/catalogue/variations`)
        .query({
          limit: 10,
          page: 1,
          filter: {
            size: '4xl'
          }
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(1)
    })

    it('Should return 200 Success when an admin successfully retrieves all product variations for a child with color filter.', async () => {
      const color = faker.color.human()
      const colorTwo = faker.color.human()
      const resProductColor = await chai
        .request(app)
        .post('/api/product-colors')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productColor: {
            name: color,
            hexCode: faker.color.rgb({ prefix: '#' }),
            rgb: faker.color.rgb({ format: 'css' })
          }
        })

      const resProductColorTwo = await chai
        .request(app)
        .post('/api/product-colors')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productColor: {
            name: colorTwo,
            hexCode: faker.color.rgb({ prefix: '#' }),
            rgb: faker.color.rgb({ format: 'css' })
          }
        })

      const resProductParent = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Smart Watch 19 3',
            jfsku: '1231sw193',
            merchantSku: '1231sw193',
            type: 'generic',
            productGroup: 'technology',
            isParent: true
          }
        })
      const parentProductId = String(resProductParent.body.product.id)
      const resProductChild = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Smart Watch 19 4',
            jfsku: '1231sw194',
            merchantSku: '1231sw194',
            type: 'generic',
            productGroup: 'technology',
            productColorId: resProductColor.body.productColor.id
          }
        })
      const resProductChild2 = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Smart Watch 19 5',
            jfsku: '1231sw195',
            merchantSku: '1231sw195',
            type: 'generic',
            productGroup: 'technology',
            productColorId: resProductColorTwo.body.productColor.id
          }
        })
      const childProductId = String(resProductChild.body.product.id)
      const childProductId2 = String(resProductChild2.body.product.id)
      await chai
        .request(app)
        .patch(`/api/products/${childProductId}/child`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            parentId: parentProductId
          }
        })
      await chai
        .request(app)
        .patch(`/api/products/${childProductId2}/child`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            parentId: parentProductId
          }
        })
      const res = await chai
        .request(app)
        .get(`/api/products/${childProductId}/catalogue/variations`)
        .query({
          limit: 10,
          page: 1,
          filter: {
            color
          }
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(1)
    })

    it('Should return 200 Success when an admin successfully retrieves all product variations for a child with material filter.', async () => {
      const material = faker.commerce.productMaterial()
      const materialTwo = faker.commerce.productMaterial()
      const resProductMaterial = await chai
        .request(app)
        .post('/api/product-materials')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productMaterial: {
            name: material
          }
        })
      const resProductMaterialTwo = await chai
        .request(app)
        .post('/api/product-materials')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productMaterial: {
            name: materialTwo
          }
        })

      const resProductParent = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Smart Watch 29 3',
            jfsku: '1231sw293',
            merchantSku: '1231sw293',
            type: 'generic',
            productGroup: 'technology',
            isParent: true
          }
        })
      const parentProductId = String(resProductParent.body.product.id)
      const resProductChild = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Smart Watch 29 4',
            jfsku: '1231sw294',
            merchantSku: '1231sw294',
            type: 'generic',
            productGroup: 'technology',
            productMaterialId: resProductMaterial.body.productMaterial.id
          }
        })
      const resProductChild2 = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Smart Watch 29 5',
            jfsku: '1231sw295',
            merchantSku: '1231sw295',
            type: 'generic',
            productGroup: 'technology',
            productMaterialId: resProductMaterialTwo.body.productMaterial.id
          }
        })
      const childProductId = String(resProductChild.body.product.id)
      const childProductId2 = String(resProductChild2.body.product.id)
      await chai
        .request(app)
        .patch(`/api/products/${childProductId}/child`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            parentId: parentProductId
          }
        })
      await chai
        .request(app)
        .patch(`/api/products/${childProductId2}/child`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            parentId: parentProductId
          }
        })
      const res = await chai
        .request(app)
        .get(`/api/products/${childProductId}/catalogue/variations`)
        .query({
          limit: 10,
          page: 1,
          filter: {
            material
          }
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf.above(0)
      res.body.products.forEach((product: IProduct) => {
        expect(product.productMaterial.name).to.equal(material.toLowerCase())
      })
    })

    it('Should return 403 Forbidden when a user not in a product access control group tries to get a product in the catalogue', async () => {
      const randomPassword = faker.internet.password()
      await createVerifiedUser('ivers974@kreeprotectedproducts.kr', randomPassword)
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ivers974@kreeprotectedproducts.kr', password: randomPassword } })

      const tokenUser = String(resUser.body.token)

      const resProduct = await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'iPhone 5',
            jfsku: '1231iph5',
            merchantSku: '1231iph5',
            type: 'generic',
            productGroup: 'technology'
          }
        })

      const productId = String(resProduct.body.product.id)

      const res = await chai
        .request(app)
        .get(`/api/products/${productId}/catalogue`)
        .query({
          limit: 10,
          page: 1
        })
        .set('Authorization', `Bearer ${tokenUser}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have access to this product in the catalogue')
    })

    it('Should return 404 Not Found when a user tries to get a product that does not exists in the catalogue', async () => {
      const res = await chai
        .request(app)
        .get('/api/products/004492b8-1ef3-4449-81f1-35fcdedba799/catalogue')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Product not found')
    })
  })
})
