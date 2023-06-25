import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'

const { expect } = chai

chai.use(chaiHttp)

describe('Webhook actions', () => {
  before(async () => {})

  after(async () => {})

  describe('Post a webhook', () => {
    it('Should return 200 OK when a user posts a webhook event', async () => {
      const res = await chai
        .request(app)
        .post('/api/webhooks/slack')
        .send([
          {
            email: 'example@test.com',
            timestamp: 1687690444,
            'smtp-id': '<14c5d75ce93.dfd.64b469@ismtpd-555>',
            event: 'test_event',
            category: [
              'cat facts'
            ],
            sg_event_id: 'OBkITHsJWzIGYYKYCglA9w==',
            sg_message_id: '14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0',
            useragent: 'Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)',
            ip: '255.255.255.255',
            url: 'http://www.sendgrid.com/',
            asm_group_id: 10
          }
        ])

      expect(res).to.have.status(200)
    })
  })
})
