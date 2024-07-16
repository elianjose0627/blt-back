import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  iversAtKreeDotKrPassword,
  sheHulkAtStarkIndustriesPassword
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string

describe('Product Material actions', () => {
  before(async () => {
    await createAdminTestUser()

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

    tokenAdmin = resAdmin.body.token
    token = resUser.body.token
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Get all product materials', () => {
    it('Should return 200 Success when an admin successfully retrieves all product materials.', async () => {
      await chai
        .request(app)
        .post('/api/product-materials')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productMaterial: {
            name: 'leather'
          }
        })

      const res = await chai
        .request(app)
        .get('/api/product-materials')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productMaterials')
      expect(res.body.productMaterials).to.be.an('array')
    })

    it('Should return 200 when a non-admin retrieves all product materials.', async () => {
      const res = await chai
        .request(app)
        .get('/api/product-materials')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productMaterials')
      expect(res.body.productMaterials).to.be.an('array')
    })
  })

  describe('Create a product material', () => {
    it('Should return 201 Created when an admin creates a product material.', async () => {
      const res = await chai
        .request(app)
        .post('/api/product-materials')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productMaterial: {
            name: 'polyester'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'productMaterial')
      expect(res.body.productMaterial).to.be.an('object')
      expect(res.body.productMaterial).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a admin creates the same product material.', async () => {
      await chai
        .request(app)
        .post('/api/product-materials')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productMaterial: {
            name: 'cotton'
          }
        })

      const res = await chai
        .request(app)
        .post('/api/product-materials')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productMaterial: {
            name: 'cotton'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productMaterial')
      expect(res.body.productMaterial).to.be.an('object')
      expect(res.body.productMaterial).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 204 when a admin deletes a product material.', async () => {
      const resProductMaterial = await chai
        .request(app)
        .post('/api/product-materials')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productMaterial: {
            name: 'silk'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/product-materials/${String(resProductMaterial.body.productMaterial.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a product material that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/product-materials/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Product Material not found')
    })
  })

  describe('Get, update and delete a product material', () => {
    it('Should return 200 OK when an owner gets a product material by id.', async () => {
      const resProductMaterial = await chai
        .request(app)
        .post('/api/product-materials')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productMaterial: {
            name: 'white'
          }
        })

      const productMaterialId = resProductMaterial.body.productMaterial.id

      const res = await chai
        .request(app)
        .get(`/api/product-materials/${String(productMaterialId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productMaterial')
      expect(res.body.productMaterial).to.be.an('object')
      expect(res.body.productMaterial).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator gets a product material by id.', async () => {
      const resProductMaterial = await chai
        .request(app)
        .post('/api/product-materials')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productMaterial: {
            name: 'cyan'
          }
        })

      const productMaterialId = resProductMaterial.body.productMaterial.id

      const res = await chai
        .request(app)
        .get(`/api/product-materials/${String(productMaterialId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productMaterial')
      expect(res.body.productMaterial).to.be.an('object')
      expect(res.body.productMaterial).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a product material by id.', async () => {
      const resProductMaterial = await chai
        .request(app)
        .post('/api/product-materials')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productMaterial: {
            name: 'pliad'
          }
        })

      const productMaterialId = resProductMaterial.body.productMaterial.id

      const res = await chai
        .request(app)
        .put(`/api/product-materials/${String(productMaterialId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productMaterial: {
            name: 'plaid'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'productMaterial')
      expect(res.body.productMaterial).to.be.an('object')
      expect(res.body.productMaterial).to.include.keys('id', 'name', 'createdAt', 'updatedAt')
      expect(res.body.productMaterial.name).to.equal('plaid')
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a product material by id.', async () => {
      const resProductMaterial = await chai
        .request(app)
        .post('/api/product-materials')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productMaterial: {
            name: 'silk'
          }
        })

      const productMaterialId = resProductMaterial.body.productMaterial.id

      const res = await chai
        .request(app)
        .put(`/api/product-materials/${String(productMaterialId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          productMaterial: {
            name: 'silk'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 200 OK when an administrator deletes a product material by id.', async () => {
      const resProductMaterial = await chai
        .request(app)
        .post('/api/product-materials')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productMaterial: {
            name: 'silk'
          }
        })

      const productMaterialId = resProductMaterial.body.productMaterial.id

      const res = await chai
        .request(app)
        .delete(`/api/product-materials/${String(productMaterialId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when an non-administrator tries to delete a product material by id.', async () => {
      const resProductMaterial = await chai
        .request(app)
        .post('/api/product-materials')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productMaterial: {
            name: 'silk'
          }
        })

      const productMaterialId = resProductMaterial.body.productMaterial.id

      const res = await chai
        .request(app)
        .delete(`/api/product-materials/${String(productMaterialId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })
})
