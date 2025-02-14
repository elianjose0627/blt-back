import sgMail from '@sendgrid/mail'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import sinon from 'sinon'
import { sendNotifierEmail } from '../../utils/sendMail'

describe('sendMail', () => {
  let sendStub: sinon.SinonStub

  beforeEach(() => {
    sendStub = sinon.stub(sgMail, 'send')
  })

  afterEach(() => {
    sendStub.restore()
  })

  it('should send an email successfully', async () => {
    const expectedResponse = [{ statusCode: 202 }]
    sendStub.resolves(expectedResponse)

    const result = await sendNotifierEmail(
      'test@example.com',
      'Test Subject',
      'Test content',
      true,
      '<p>Test content</p>',
      false
    )

    expect(result).to.deep.equal(expectedResponse)
  })

  it('should send an email successfully when html is empty', async () => {
    const expectedResponse = [{ statusCode: 202 }]
    sendStub.resolves(expectedResponse)

    const result = await sendNotifierEmail(
      'test@example.com',
      'Test Subject',
      'Test content',
      true,
      '',
      false
    )

    expect(result).to.deep.equal(expectedResponse)
  })

  it('should handle error when email sending fails', async () => {
    const errorMessage = 'Failed to send email'
    sendStub.rejects({
      response: {
        body: {
          errors: [{ message: errorMessage }]
        }
      }
    })

    const result = await sendNotifierEmail(
      'test@example.com',
      'Test Subject',
      'Test content',
      true,
      '<p>Test content</p>',
      false
    )

    expect(result).to.equal(errorMessage)
  })
})
