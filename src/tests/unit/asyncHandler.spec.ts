import chai from 'chai'
import sinonChai from 'sinon-chai'
import sinon from 'sinon'
import { mockReq, mockRes } from 'sinon-express-mock'
import asyncHandler from '../../middlewares/asyncHandler'

const { expect } = chai

chai.use(sinonChai)

describe('asyncHandler', () => {
  it('should throw an error and return status code of 500', async () => {
    const throwError = async (req: any, res: any, next: any): Promise<any> => {
      const {
        data: { functionThatDoesNotExist }
      } = req
      functionThatDoesNotExist()
    }
    const request = {
      headers: {
        authorization: ''
      }
    }
    const req = mockReq(request)
    const res = mockRes()
    const next = sinon.spy()

    const response = asyncHandler(throwError)
    await response(req, res, next)
    expect(res.status).to.have.been.calledWith(500)
  })

  it('should throw an error and return status code of 400', async () => {
    const throwError = (): void => {
      const error: any = new Error('Request failed with status code 400')
      error.response = { status: 400 }
      throw error
    }
    const mockRequest = {
      headers: {
        authorization: ''
      }
    }

    const req = mockReq(mockRequest)
    const res = mockRes()
    const next = sinon.spy()

    const response = asyncHandler(throwError)

    await response(req, res, next)
    expect(res.status).to.have.been.calledWith(400)
  })

  it('should throw an error and return status code of 400', async () => {
    const throwError = (): void => {
      class SequelizeConnectionError extends Error {
        errors: Array<{ message: string }>
        constructor () {
          super()

          this.name = 'SequelizeConnectionError'
          this.errors = [
            {
              message: 'Sequelize Connection Error'
            }
          ]
        }
      }
      throw new SequelizeConnectionError()
    }
    const request = {
      headers: {
        authorization: ''
      }
    }
    const req = mockReq(request)
    const res = mockRes()
    const next = sinon.spy()

    const response = asyncHandler(throwError)

    await response(req, res, next)
    expect(res.status).to.have.been.calledWith(400)
  })
})
