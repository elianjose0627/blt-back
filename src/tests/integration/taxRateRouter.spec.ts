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

describe('Tax Rate actions', () => {
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

  describe('Get all tax rates', () => {
    it('Should return 200 Success when an admin successfully retrieves all tax rates.', async () => {
      const res = await chai
        .request(app)
        .get('/api/tax-rates')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'taxRates')
      expect(res.body.taxRates).to.be.an('array')
    })

    it('Should return 200 when a non-admin retrieves all tax rates.', async () => {
      const res = await chai
        .request(app)
        .get('/api/tax-rates')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'taxRates')
      expect(res.body.taxRates).to.be.an('array')
    })
  })

  describe('Create a tax rate', () => {
    it('Should return 201 Created when an admin creates a tax rate.', async () => {
      const res = await chai
        .request(app)
        .post('/api/tax-rates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          taxRate: {
            publicId: 1,
            name: 'Normaler Steuersatz',
            zone: 'Zone-EU',
            countryCode: 'DE',
            rate: '19'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'taxRate')
      expect(res.body.taxRate).to.be.an('object')
      expect(res.body.taxRate).to.include.keys('id', 'publicId', 'name', 'zone', 'countryCode', 'rate', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a user creates the same tax rate.', async () => {
      await chai
        .request(app)
        .post('/api/tax-rates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          taxRate: {
            publicId: 2,
            name: 'Normaler Steuersatz',
            zone: 'Zone-EU',
            countryCode: 'DE',
            rate: '19'
          }
        })
      const res = await chai
        .request(app)
        .post('/api/tax-rates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          taxRate: {
            publicId: 2,
            name: 'Normaler Steuersatz',
            zone: 'Zone-EU',
            countryCode: 'DE',
            rate: '19'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'taxRate')
      expect(res.body.taxRate).to.be.an('object')
      expect(res.body.taxRate).to.include.keys('id', 'publicId', 'name', 'zone', 'countryCode', 'rate', 'createdAt', 'updatedAt')
    })

    it('Should return 204 when a admin deletes a tax rate.', async () => {
      const resTaxRate = await chai
        .request(app)
        .post('/api/tax-rates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          taxRate: {
            publicId: 3,
            name: 'Normaler Steuersatz',
            zone: 'Zone-EU',
            countryCode: 'DE',
            rate: '19'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/tax-rates/${String(resTaxRate.body.taxRate.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a tax rate that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/tax-rates/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Tax Rate not found')
    })
  })

  describe('Get, update and delete a tax rate', () => {
    it('Should return 200 OK when an owner gets a tax rate by id.', async () => {
      const resTaxRate = await chai
        .request(app)
        .post('/api/tax-rates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          taxRate: {
            publicId: 4,
            name: 'Normaler Steuersatz',
            zone: 'Zone-EU',
            countryCode: 'DE',
            rate: '19'
          }
        })

      const taxRateId = resTaxRate.body.taxRate.id

      const res = await chai
        .request(app)
        .get(`/api/tax-rates/${String(taxRateId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'taxRate')
      expect(res.body.taxRate).to.be.an('object')
      expect(res.body.taxRate).to.include.keys('id', 'publicId', 'name', 'zone', 'countryCode', 'rate', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator gets a tax rate by id.', async () => {
      const resTaxRate = await chai
        .request(app)
        .post('/api/tax-rates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          taxRate: {
            publicId: 5,
            name: 'Normaler Steuersatz',
            zone: 'Zone-EU',
            countryCode: 'DE',
            rate: '19'
          }
        })

      const taxRateId = resTaxRate.body.taxRate.id

      const res = await chai
        .request(app)
        .get(`/api/tax-rates/${String(taxRateId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'taxRate')
      expect(res.body.taxRate).to.be.an('object')
      expect(res.body.taxRate).to.include.keys('id', 'publicId', 'name', 'zone', 'countryCode', 'rate', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a tax rate by id.', async () => {
      const resTaxRate = await chai
        .request(app)
        .post('/api/tax-rates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          taxRate: {
            publicId: 6,
            name: 'Normaler Steuersatz',
            zone: 'Zone-EU',
            countryCode: 'DE',
            rate: '19'
          }
        })

      const taxRateId = resTaxRate.body.taxRate.id

      const res = await chai
        .request(app)
        .put(`/api/tax-rates/${String(taxRateId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          taxRate: {
            name: 'Normaler Steuersatz Edited',
            zone: 'Zone-EU',
            countryCode: 'DE',
            rate: '19'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'taxRate')
      expect(res.body.taxRate).to.be.an('object')
      expect(res.body.taxRate).to.include.keys('id', 'publicId', 'name', 'zone', 'countryCode', 'rate', 'createdAt', 'updatedAt')
      expect(res.body.taxRate.name).to.equal('Normaler Steuersatz Edited')
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a tax rate by id.', async () => {
      const resTaxRate = await chai
        .request(app)
        .post('/api/tax-rates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          taxRate: {
            publicId: 7,
            name: 'Normaler Steuersatz',
            zone: 'Zone-EU',
            countryCode: 'DE',
            rate: '19'
          }
        })

      const taxRateId = resTaxRate.body.taxRate.id

      const res = await chai
        .request(app)
        .put(`/api/tax-rates/${String(taxRateId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          taxRate: {
            publicId: 8,
            name: 'Normaler Steuersatz',
            zone: 'Zone-EU',
            countryCode: 'DE',
            rate: '19'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 200 OK when an administrator deletes a tax rate by id.', async () => {
      const resTaxRate = await chai
        .request(app)
        .post('/api/tax-rates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          taxRate: {
            publicId: 9,
            name: 'Normaler Steuersatz',
            zone: 'Zone-EU',
            countryCode: 'DE',
            rate: '19'
          }
        })

      const taxRateId = resTaxRate.body.taxRate.id

      const res = await chai
        .request(app)
        .delete(`/api/tax-rates/${String(taxRateId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when an non-administrator tries to delete a tax rate by id.', async () => {
      const resTaxRate = await chai
        .request(app)
        .post('/api/tax-rates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          taxRate: {
            publicId: 10,
            name: 'Normaler Steuersatz',
            zone: 'Zone-EU',
            countryCode: 'DE',
            rate: '19'
          }
        })

      const taxRateId = resTaxRate.body.taxRate.id

      const res = await chai
        .request(app)
        .delete(`/api/tax-rates/${String(taxRateId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })
})
