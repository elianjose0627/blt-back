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

describe('Sales Unit actions', () => {
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

  describe('Get all sales units', () => {
    it('Should return 200 Success when an admin successfully retrieves all sales units.', async () => {
      const res = await chai
        .request(app)
        .get('/api/sales-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'salesUnits')
      expect(res.body.salesUnits).to.be.an('array')
    })

    it('Should return 200 when a non-admin retrieves all sales units.', async () => {
      const res = await chai
        .request(app)
        .get('/api/sales-units')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'salesUnits')
      expect(res.body.salesUnits).to.be.an('array')
    })
  })

  describe('Create a sales unit', () => {
    it('Should return 201 Created when an admin creates a sales unit.', async () => {
      const res = await chai
        .request(app)
        .post('/api/sales-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salesUnit: {
            publicId: 1,
            name: 'one',
            unit: 1
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'salesUnit')
      expect(res.body.salesUnit).to.be.an('object')
      expect(res.body.salesUnit).to.include.keys('id', 'publicId', 'name', 'unit', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a user creates the same sales unit.', async () => {
      await chai
        .request(app)
        .post('/api/sales-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salesUnit: {
            publicId: 2,
            name: 'two',
            unit: 2
          }
        })
      const res = await chai
        .request(app)
        .post('/api/sales-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salesUnit: {
            publicId: 2,
            name: 'two',
            unit: 2
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'salesUnit')
      expect(res.body.salesUnit).to.be.an('object')
      expect(res.body.salesUnit).to.include.keys('id', 'publicId', 'name', 'unit', 'createdAt', 'updatedAt')
    })

    it('Should return 204 when a admin deletes a sales unit.', async () => {
      const resSalesUnit = await chai
        .request(app)
        .post('/api/sales-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salesUnit: {
            publicId: 3,
            name: 'three',
            unit: 3
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/sales-units/${String(resSalesUnit.body.salesUnit.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a sales unit that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/sales-units/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Sales Unit not found')
    })
  })

  describe('Get, update and delete a sales unit', () => {
    it('Should return 200 OK when an owner gets a sales unit by id.', async () => {
      const resSalesUnit = await chai
        .request(app)
        .post('/api/sales-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salesUnit: {
            publicId: 4,
            name: 'four',
            unit: 4
          }
        })

      const salesUnitId = resSalesUnit.body.salesUnit.id

      const res = await chai
        .request(app)
        .get(`/api/sales-units/${String(salesUnitId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'salesUnit')
      expect(res.body.salesUnit).to.be.an('object')
      expect(res.body.salesUnit).to.include.keys('id', 'publicId', 'name', 'unit', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator gets a sales unit by id.', async () => {
      const resSalesUnit = await chai
        .request(app)
        .post('/api/sales-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salesUnit: {
            publicId: 5,
            name: 'five',
            unit: 5
          }
        })

      const salesUnitId = resSalesUnit.body.salesUnit.id

      const res = await chai
        .request(app)
        .get(`/api/sales-units/${String(salesUnitId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'salesUnit')
      expect(res.body.salesUnit).to.be.an('object')
      expect(res.body.salesUnit).to.include.keys('id', 'publicId', 'name', 'unit', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a sales unit by id.', async () => {
      const resSalesUnit = await chai
        .request(app)
        .post('/api/sales-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salesUnit: {
            publicId: 6,
            name: 'six',
            unit: 6
          }
        })

      const salesUnitId = resSalesUnit.body.salesUnit.id

      const res = await chai
        .request(app)
        .put(`/api/sales-units/${String(salesUnitId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salesUnit: {
            name: 'siete',
            unit: 6
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'salesUnit')
      expect(res.body.salesUnit).to.be.an('object')
      expect(res.body.salesUnit).to.include.keys('id', 'publicId', 'name', 'unit', 'createdAt', 'updatedAt')
      expect(res.body.salesUnit.name).to.equal('siete')
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a sales unit by id.', async () => {
      const resSalesUnit = await chai
        .request(app)
        .post('/api/sales-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salesUnit: {
            publicId: 7,
            name: 'seven',
            unit: 7
          }
        })

      const salesUnitId = resSalesUnit.body.salesUnit.id

      const res = await chai
        .request(app)
        .put(`/api/sales-units/${String(salesUnitId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          salesUnit: {
            publicId: 8,
            name: 'eight',
            unit: 8
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 200 OK when an administrator deletes a sales unit by id.', async () => {
      const resSalesUnit = await chai
        .request(app)
        .post('/api/sales-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salesUnit: {
            publicId: 9,
            name: 'nine',
            unit: 9
          }
        })

      const salesUnitId = resSalesUnit.body.salesUnit.id

      const res = await chai
        .request(app)
        .delete(`/api/sales-units/${String(salesUnitId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when an non-administrator tries to delete a sales unit by id.', async () => {
      const resSalesUnit = await chai
        .request(app)
        .post('/api/sales-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          salesUnit: {
            publicId: 10,
            name: 'ten',
            unit: 10
          }
        })

      const salesUnitId = resSalesUnit.body.salesUnit.id

      const res = await chai
        .request(app)
        .delete(`/api/sales-units/${String(salesUnitId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })
})
