import chai from 'chai'
import sinonChai from 'sinon-chai'
import { mockReq, mockRes } from 'sinon-express-mock'
import passport from 'passport'
import sinon from 'sinon'
import checkResetToken from '../../middlewares/checkResetToken'
import * as statusCodes from '../../constants/statusCodes'

const { expect } = chai

chai.use(sinonChai)

describe('middlewares', () => {
  describe('checkResetToken', () => {
    let authenticateStub: sinon.SinonStub

    beforeEach(() => {
      authenticateStub = sinon.stub(passport, 'authenticate')
    })

    afterEach(() => {
      authenticateStub.restore()
    })

    it('should call next() when token is valid and type is reset', (done) => {
      const request = {}
      const req: any = mockReq(request)
      const res: any = mockRes()
      const mockUser = { id: 1, email: 'test@test.com' }

      authenticateStub.returns((req: any, res: any, next: any) => {
        authenticateStub.yield(null, mockUser, { type: 'reset' })
      })

      checkResetToken(req, res, () => {
        expect(req.user).to.deep.equal(mockUser)
        done()
      })
    })

    it('should return unauthorized when token is invalid', (done) => {
      const request = {}
      const req: any = mockReq(request)
      const res: any = mockRes()

      authenticateStub.returns((req: any, res: any, next: any) => {
        authenticateStub.yield(null, null, { message: 'Invalid token' })
      })

      checkResetToken(req, res, () => {})

      expect(res.status).to.have.been.calledWith(statusCodes.UNAUTHORIZED)
      expect(res.send).to.have.been.calledWith({
        statusCode: statusCodes.UNAUTHORIZED,
        success: false,
        errors: {
          message: 'Invalid token'
        }
      })
      done()
    })

    it('should call next(err) when authentication throws error', (done) => {
      const request = {}
      const req: any = mockReq(request)
      const res: any = mockRes()
      const error = new Error('Authentication error')

      authenticateStub.returns((req: any, res: any, next: any) => {
        authenticateStub.yield(error, null, null)
      })

      checkResetToken(req, res, (err: any) => {
        expect(err).to.equal(error)
        done()
      })
    })
  })
})
