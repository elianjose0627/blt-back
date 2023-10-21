import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import paginate from '../../middlewares/pagination'
import { mockReq, mockRes } from 'sinon-express-mock'
import type { CustomNext, CustomRequest, CustomResponse } from '../../types'

chai.use(sinonChai)

describe('paginate middleware', () => {
  let req: CustomRequest
  let res: CustomResponse
  let next: CustomNext

  beforeEach(() => {
    req = mockReq({})
    res = mockRes()
    next = sinon.spy()
  })

  it('should set default limit and page values when not provided in the request', () => {
    paginate(req, res, next)

    expect(req.query).to.eql({ limit: 20, offset: 0, page: 1 })
  })

  it('should set provided limit and page values in the request', () => {
    req.query = { limit: 10, page: 2 }

    paginate(req, res, next)

    expect(req.query).to.eql({ limit: 10, offset: 10, page: 2 })
  })

  it('should set default limit and corrected page value when provided page value is less than 1', () => {
    req.query = { page: -1 }

    paginate(req, res, next)

    expect(req.query).to.eql({ limit: 20, offset: 0, page: 1 })
  })

  it('should set default page and corrected limit value when provided limit value is less than 0', () => {
    req.query = { limit: -1 }

    paginate(req, res, next)

    expect(req.query).to.eql({ limit: 20, offset: 0, page: 1 })
  })

  it('should call the next function', () => {
    paginate(req, res, next)

    expect(next).to.have.been.calledOnceWithExactly()
  })
})
