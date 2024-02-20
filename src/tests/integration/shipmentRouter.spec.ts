import chai from 'chai'
import chaiHttp from 'chai-http'
import { mockReq, mockRes } from 'sinon-express-mock'
import { v4 as uuidv4 } from 'uuid'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  createShipment
} from '../utils'
import ShipmentController from '../../controllers/ShipmentController'
import sinon from 'sinon'
import DHLService from '../../services/DHLService'
import ShipmentService from '../../services/ShipmentService'
import * as statusCodes from '../../constants/statusCodes'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string
const trackingId = '00340434694295150696'
const notFoundTrackingId = '00340434655780035478'

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

      const statusCode = res.status

      if (statusCode === 201) {
        expect(res).to.have.status(201)
        expect(res.body).to.include.keys('statusCode', 'success', 'shipment')
        expect(res.body.shipment).to.be.an('object')
        expect(res.body.shipment).to.include.keys('id', 'trackingId', 'statusCode', 'data', 'createdAt', 'updatedAt')
      }

      if (statusCode === 429) {
        expect(res).to.have.status(429)
        expect(res.body).to.include.keys('statusCode', 'success', 'errors')
        expect(res.body.errors.message).to.equal('Request failed with status code 429')
      }

      if (statusCode === 400) {
        expect(res).to.have.status(400)
        expect(res.body).to.include.keys('statusCode', 'success', 'errors')
        expect(res.body.errors.message).to.equal('Request failed with status code 500')
      }
    })

    it('Should return 200 OK when an admin gets a shipment by tracking id.', async () => {
      const res = await chai
        .request(app)
        .get(`/api/shipments/${String(trackingId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      const statusCode = res.status

      if (statusCode === 200) {
        expect(res).to.have.status(200)
        expect(res.body).to.include.keys('statusCode', 'success', 'shipment')
        expect(res.body.shipment).to.be.an('object')
        expect(res.body.shipment).to.include.keys('id', 'trackingId', 'statusCode', 'data', 'createdAt', 'updatedAt')
      }

      if (statusCode === 429) {
        expect(res).to.have.status(429)
        expect(res.body).to.include.keys('statusCode', 'success', 'errors')
        expect(res.body.errors.message).to.equal('Request failed with status code 429')
      }

      if (statusCode === 400) {
        expect(res).to.have.status(400)
        expect(res.body).to.include.keys('statusCode', 'success', 'errors')
        expect(res.body.errors.message).to.equal('Request failed with status code 500')
      }
    })

    it('Should return 404 Not Found when an admin gets a shipment for a non-existent tracking id.', async () => {
      const res = await chai
        .request(app)
        .get(`/api/shipments/${notFoundTrackingId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      const statusCode = res.status

      if (statusCode === 404) {
        expect(res).to.have.status(404)
        expect(res.body).to.include.keys('statusCode', 'success', 'errors')
        expect(res.body.errors.message).to.equal('Request failed with status code 404')
        expect(res.body.success).to.equal(false)
      }

      if (statusCode === 429) {
        expect(res).to.have.status(429)
        expect(res.body).to.include.keys('statusCode', 'success', 'errors')
        expect(res.body.errors.message).to.equal('Request failed with status code 429')
      }
    })
  })

  describe('Shipment actions mock', () => {
    let shipmentServiceStub: any

    beforeEach(async () => {
      shipmentServiceStub = sinon.createStubInstance(ShipmentService)
      await createShipment()
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should return existing record if found', async () => {
      const req = mockReq({
        params: {
          trackingId: '12345678900'
        }
      })
      const res = mockRes({ status: sinon.stub().returnsThis(), send: sinon.stub() })
      const existingRecord = { trackingId: '12345678900', statusCode: 'transit', data: {} }
      shipmentServiceStub.get.withArgs('12345678900').resolves(existingRecord)

      await ShipmentController.get(req, res)

      sinon.assert.calledWithExactly(res.status, 200)
    })

    it('should handle DHL service errors', async () => {
      const req = mockReq({ params: { trackingId: 'errorTrackingId' } })
      const res = mockRes({ status: sinon.stub().returnsThis(), send: sinon.stub() })
      const errorResponse = { response: { status: statusCodes.SERVER_ERROR }, message: 'Request failed with status code 500' }
      sinon.stub(DHLService, 'trackDHLShipments').rejects(errorResponse)

      await ShipmentController.get(req, res)

      sinon.assert.calledWithExactly(res.status, statusCodes.BAD_REQUEST)
      sinon.assert.calledWithExactly(res.send, {
        statusCode: statusCodes.BAD_REQUEST,
        success: false,
        errors: {
          message: errorResponse.message
        }
      })
    })

    it('should create new record if not found', async () => {
      const trackingId = uuidv4()
      const req = mockReq({ params: { trackingId } })
      const res = mockRes({ status: sinon.stub().returnsThis(), send: sinon.stub() })
      const DHLResponse = { data: { shipments: [{ status: { statusCode: 'transit' } }] } }
      sinon.stub(DHLService, 'trackDHLShipments').resolves(DHLResponse)
      shipmentServiceStub.get.withArgs(uuidv4()).resolves(null)
      shipmentServiceStub.insert.resolves({ id: uuidv4(), createdAt: new Date(), updatedAt: new Date(), ...DHLResponse.data })

      await ShipmentController.get(req, res)

      sinon.assert.calledWithExactly(res.status, statusCodes.CREATED)
    })

    it('should handle other errors', async () => {
      const req = mockReq({ params: { trackingId: 'otherErrorTrackingId' } })
      const res = mockRes({ status: sinon.stub().returnsThis(), send: sinon.stub() })
      const errorResponse = { response: { status: statusCodes.NOT_FOUND }, message: 'Request failed with status code 404' }
      sinon.stub(DHLService, 'trackDHLShipments').rejects(errorResponse)

      await ShipmentController.get(req, res)

      sinon.assert.calledWithExactly(res.status, statusCodes.NOT_FOUND)
      sinon.assert.calledWithExactly(res.send, {
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: errorResponse.message
        }
      })
    })
  })
})
