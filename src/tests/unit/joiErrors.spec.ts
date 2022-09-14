import chai from 'chai'
import sinonChai from 'sinon-chai'
import { mockReq, mockRes } from 'sinon-express-mock'
import joiErrors from '../../middlewares/joiErrors'

const { expect } = chai

chai.use(sinonChai)

describe('middlewares', () => {
  describe('joiErrors', () => {
    it('should return call next if there are no celebrate errors', (done) => {
      const request = {}
      const req: any = mockReq(request)
      const res: any = mockRes()
      const err = false

      joiErrors(err, req, res, () => {
        expect(req.joiError).to.equal(false)
        done()
      })
    })
  })
})
