import chai from 'chai'
import chaiHttp from 'chai-http'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import dayjs from 'dayjs'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  createMaintenanceMode,
  deleteAllMaintenanceModes
} from '../utils'

dayjs.extend(localizedFormat)
const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string
const endDate = dayjs().add(2, 'hours').toDate()
const startDate = dayjs().add(1, 'hour').toDate()

describe('Maintenance mode actions', () => {
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
    await deleteAllMaintenanceModes()
  })

  describe('Get all maintenance modes', () => {
    it('Should return 200 Success when an admin successfully retrieves all maintenance modes.', async () => {
      const res = await chai
        .request(app)
        .get('/api/maintenance-modes')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'maintenanceModes')
      expect(res.body.maintenanceModes).to.be.an('array')
    })

    it('Should return 200 when a non-admin retrieves all maintenance modes.', async () => {
      await chai
        .request(app)
        .post('/api/maintenance-modes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          maintenanceMode: {
            isActive: true,
            reason: 'A new module has been set up',
            startDate,
            endDate
          }
        })

      const res = await chai
        .request(app)
        .get('/api/maintenance-modes')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'maintenanceModes')
      expect(res.body.maintenanceModes).to.be.an('array')
    })
  })

  describe('Create a maintenance modes', () => {
    it('Should return 201 Created when an admin creates a maintenance modes.', async () => {
      const res = await chai
        .request(app)
        .post('/api/maintenance-modes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          maintenanceMode: {
            isActive: true,
            reason: 'A new module has been set up',
            startDate,
            endDate
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'maintenanceMode')
      expect(res.body.maintenanceMode).to.be.an('object')
      expect(res.body.maintenanceMode).to.include.keys('id', 'isActive', 'reason', 'endDate', 'startDate', 'createdAt', 'updatedAt')
    })

    it('Should return 204 when a admin deletes a maintenance mode.', async () => {
      const resMaintenanceMode = await chai
        .request(app)
        .post('/api/maintenance-modes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          maintenanceMode: {
            isActive: true,
            reason: 'A new module has been set up',
            startDate,
            endDate
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/maintenance-modes/${String(resMaintenanceMode.body.maintenanceMode.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a maintenance mode that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/maintenance-modes/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('MaintenanceMode not found')
    })
  })

  describe('Get, update and delete a maintenance node', () => {
    it('Should return 200 OK when an owner gets a maintenance mode by id.', async () => {
      const resMaintenanceMode = await chai
        .request(app)
        .post('/api/maintenance-modes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          maintenanceMode: {
            isActive: true,
            reason: 'A new module has been set up',
            startDate,
            endDate
          }
        })

      const maintenanceModeId = resMaintenanceMode.body.maintenanceMode.id

      const res = await chai
        .request(app)
        .get(`/api/maintenance-modes/${String(maintenanceModeId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'maintenanceMode')
      expect(res.body.maintenanceMode).to.be.an('object')
      expect(res.body.maintenanceMode).to.include.keys('id', 'isActive', 'reason', 'endDate', 'startDate', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator gets a maintenance mode by id.', async () => {
      const resMaintenanceMode = await chai
        .request(app)
        .post('/api/maintenance-modes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          maintenanceMode: {
            isActive: true,
            reason: 'A new module has been set up',
            startDate,
            endDate
          }
        })

      const maintenanceModeId = resMaintenanceMode.body.maintenanceMode.id

      const res = await chai
        .request(app)
        .get(`/api/maintenance-modes/${String(maintenanceModeId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'maintenanceMode')
      expect(res.body.maintenanceMode).to.be.an('object')
      expect(res.body.maintenanceMode).to.include.keys('id', 'isActive', 'reason', 'endDate', 'startDate', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a maintenance mode by id.', async () => {
      const resMaintenanceMode = await chai
        .request(app)
        .post('/api/maintenance-modes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          maintenanceMode: {
            isActive: true,
            reason: 'A new module has been set up',
            startDate,
            endDate
          }
        })

      const maintenanceModeId = resMaintenanceMode.body.maintenanceMode.id

      const res = await chai
        .request(app)
        .put(`/api/maintenance-modes/${String(maintenanceModeId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          maintenanceMode: {
            isActive: true,
            reason: 'A new module has been updated',
            startDate,
            endDate
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'maintenanceMode')
      expect(res.body.maintenanceMode).to.be.an('object')
      expect(res.body.maintenanceMode).to.include.keys('id', 'isActive', 'reason', 'endDate', 'startDate', 'createdAt', 'updatedAt')
      expect(res.body.maintenanceMode.reason).to.equal('A new module has been updated')
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a maintenance mode by id.', async () => {
      const resMaintenanceMode = await chai
        .request(app)
        .post('/api/maintenance-modes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          maintenanceMode: {
            isActive: true,
            reason: 'A new module has been set up',
            startDate,
            endDate
          }
        })

      const maintenanceModeId = resMaintenanceMode.body.maintenanceMode.id

      const res = await chai
        .request(app)
        .put(`/api/maintenance-modes/${String(maintenanceModeId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          maintenanceMode: {
            isActive: true,
            reason: 'A new module has been set up',
            startDate,
            endDate
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 200 OK when an administrator deletes a maintenance mode by id.', async () => {
      const resMaintenanceMode = await chai
        .request(app)
        .post('/api/maintenance-modes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          maintenanceMode: {
            isActive: true,
            reason: 'A new module has been set up',
            startDate,
            endDate
          }
        })

      const maintenanceModeId = resMaintenanceMode.body.maintenanceMode.id

      const res = await chai
        .request(app)
        .delete(`/api/maintenance-modes/${String(maintenanceModeId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when an non-administrator tries to delete a maintenance mode by id.', async () => {
      const resMaintenanceMode = await chai
        .request(app)
        .post('/api/maintenance-modes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          maintenanceMode: {
            isActive: true,
            reason: 'A new module has been set up',
            startDate,
            endDate
          }
        })

      const maintenanceModeId = resMaintenanceMode.body.maintenanceMode.id

      const res = await chai
        .request(app)
        .delete(`/api/maintenance-modes/${String(maintenanceModeId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 503 Service Unavailable when an admin tries to do write operations while a maintenance is ongoing.', async () => {
      const startDate = dayjs().subtract(1, 'minute')
      const endDate = dayjs().add(10, 'minute')
      await createMaintenanceMode(startDate, endDate, 'A new module is being set up')
      const res = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@testcompany.com',
            domain: 'testcompany.com'
          }
        })

      expect(res).to.have.status(503)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    })
  })
})
