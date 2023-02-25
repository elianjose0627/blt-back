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
const trackingId = '00340434694295150696'

describe('Shipment actions', () => {
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

  describe('Get a shipment', () => {
    it('Should return 200 OK when a user gets a shipment by tracking id.', async () => {
      const res = await chai
        .request(app)
        .get(`/api/shipments/${String(trackingId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'shipment')
      expect(res.body.shipment).to.be.an('object')
      expect(res.body.shipment).to.include.keys('id', 'trackingId', 'statusCode', 'data', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an admin gets a shipment by tracking id.', async () => {
      const res = await chai
        .request(app)
        .get(`/api/shipments/${String(trackingId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'shipment')
      expect(res.body.shipment).to.be.an('object')
      expect(res.body.shipment).to.include.keys('id', 'trackingId', 'statusCode', 'data', 'createdAt', 'updatedAt')
    })
  })
})
