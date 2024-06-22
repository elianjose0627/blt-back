import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string

describe('Mass Unit actions', () => {
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

  describe('Get all mass units', () => {
    it('Should return 200 Success when an admin successfully retrieves all mass units.', async () => {
      const res = await chai
        .request(app)
        .get('/api/mass-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'massUnits')
      expect(res.body.massUnits).to.be.an('array')
    })

    it('Should return 200 when a non-admin retrieves all mass units.', async () => {
      const res = await chai
        .request(app)
        .get('/api/mass-units')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'massUnits')
      expect(res.body.massUnits).to.be.an('array')
    })
  })

  describe('Create a mass unit', () => {
    it('Should return 201 Created when an admin creates a mass unit.', async () => {
      const res = await chai
        .request(app)
        .post('/api/mass-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          massUnit: {
            publicId: 1,
            code: 'm',
            name: 'meter',
            displayCode: 'm',
            referenceMassUnit: 0,
            referenceMassUnitFactor: 0.00
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'massUnit')
      expect(res.body.massUnit).to.be.an('object')
      expect(res.body.massUnit).to.include.keys('id', 'publicId', 'name', 'code', 'displayCode', 'referenceMassUnit', 'referenceMassUnitFactor', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a user creates the same mass unit.', async () => {
      await chai
        .request(app)
        .post('/api/mass-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          massUnit: {
            publicId: 2,
            code: 'm',
            name: 'meter',
            displayCode: 'm',
            referenceMassUnit: 0,
            referenceMassUnitFactor: 0.00
          }
        })
      const res = await chai
        .request(app)
        .post('/api/mass-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          massUnit: {
            publicId: 2,
            code: 'm',
            name: 'meter',
            displayCode: 'm',
            referenceMassUnit: 0,
            referenceMassUnitFactor: 0.00
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'massUnit')
      expect(res.body.massUnit).to.be.an('object')
      expect(res.body.massUnit).to.include.keys('id', 'publicId', 'name', 'code', 'displayCode', 'referenceMassUnit', 'referenceMassUnitFactor', 'createdAt', 'updatedAt')
    })

    it('Should return 204 when a admin deletes a mass unit.', async () => {
      const resMassUnit = await chai
        .request(app)
        .post('/api/mass-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          massUnit: {
            publicId: 3,
            code: 'm',
            name: 'meter',
            displayCode: 'm',
            referenceMassUnit: 0,
            referenceMassUnitFactor: 0.00
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/mass-units/${String(resMassUnit.body.massUnit.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a mass unit that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/mass-units/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Mass Unit not found')
    })
  })

  describe('Get, update and delete a mass unit', () => {
    it('Should return 200 OK when an owner gets a mass unit by id.', async () => {
      const resMassUnit = await chai
        .request(app)
        .post('/api/mass-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          massUnit: {
            publicId: 4,
            code: 'm',
            name: 'meter',
            displayCode: 'm',
            referenceMassUnit: 0,
            referenceMassUnitFactor: 0.00
          }
        })

      const massUnitId = resMassUnit.body.massUnit.id

      const res = await chai
        .request(app)
        .get(`/api/mass-units/${String(massUnitId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'massUnit')
      expect(res.body.massUnit).to.be.an('object')
      expect(res.body.massUnit).to.include.keys('id', 'publicId', 'name', 'code', 'displayCode', 'referenceMassUnit', 'referenceMassUnitFactor', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator gets a mass unit by id.', async () => {
      const resMassUnit = await chai
        .request(app)
        .post('/api/mass-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          massUnit: {
            publicId: 5,
            code: 'm',
            name: 'meter',
            displayCode: 'm',
            referenceMassUnit: 0,
            referenceMassUnitFactor: 0.00
          }
        })

      const massUnitId = resMassUnit.body.massUnit.id

      const res = await chai
        .request(app)
        .get(`/api/mass-units/${String(massUnitId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'massUnit')
      expect(res.body.massUnit).to.be.an('object')
      expect(res.body.massUnit).to.include.keys('id', 'publicId', 'name', 'code', 'displayCode', 'referenceMassUnit', 'referenceMassUnitFactor', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a mass unit by id.', async () => {
      const resMassUnit = await chai
        .request(app)
        .post('/api/mass-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          massUnit: {
            publicId: 6,
            code: 'm',
            name: 'meter',
            displayCode: 'm',
            referenceMassUnit: 0,
            referenceMassUnitFactor: 0.00
          }
        })

      const massUnitId = resMassUnit.body.massUnit.id

      const res = await chai
        .request(app)
        .put(`/api/mass-units/${String(massUnitId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          massUnit: {
            name: 'meters',
            displayCode: 'm',
            referenceMassUnit: 0,
            referenceMassUnitFactor: 0.00
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'massUnit')
      expect(res.body.massUnit).to.be.an('object')
      expect(res.body.massUnit).to.include.keys('id', 'publicId', 'name', 'code', 'displayCode', 'referenceMassUnit', 'referenceMassUnitFactor', 'createdAt', 'updatedAt')
      expect(res.body.massUnit.name).to.equal('meters')
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a mass unit by id.', async () => {
      const resMassUnit = await chai
        .request(app)
        .post('/api/mass-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          massUnit: {
            publicId: 7,
            code: 'm',
            name: 'meter',
            displayCode: 'm',
            referenceMassUnit: 0,
            referenceMassUnitFactor: 0.00
          }
        })

      const massUnitId = resMassUnit.body.massUnit.id

      const res = await chai
        .request(app)
        .put(`/api/mass-units/${String(massUnitId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          massUnit: {
            publicId: 8,
            code: 'm',
            name: 'meter',
            displayCode: 'm',
            referenceMassUnit: 0,
            referenceMassUnitFactor: 0.00
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 200 OK when an administrator deletes a mass unit by id.', async () => {
      const resMassUnit = await chai
        .request(app)
        .post('/api/mass-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          massUnit: {
            publicId: 9,
            code: 'm',
            name: 'meter',
            displayCode: 'm',
            referenceMassUnit: 0,
            referenceMassUnitFactor: 0.00
          }
        })

      const massUnitId = resMassUnit.body.massUnit.id

      const res = await chai
        .request(app)
        .delete(`/api/mass-units/${String(massUnitId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when an non-administrator tries to delete a mass unit by id.', async () => {
      const resMassUnit = await chai
        .request(app)
        .post('/api/mass-units')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          massUnit: {
            publicId: 10,
            code: 'm',
            name: 'meter',
            displayCode: 'm',
            referenceMassUnit: 0,
            referenceMassUnitFactor: 0.00
          }
        })

      const massUnitId = resMassUnit.body.massUnit.id

      const res = await chai
        .request(app)
        .delete(`/api/mass-units/${String(massUnitId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })
})
