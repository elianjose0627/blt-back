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
        .set('X-Twilio-Email-Event-Webhook-Signature', 'MEYCIQC/I4o6vCgqRYrTljjoVWB/GRWNtxeePlLMHr3x9ETeRQIhAIpV+03nREPTTHWSW0wIOA0EoMPdcNgXa70yCaqDJlu5')
        .set('X-Twilio-Email-Event-Webhook-Timestamp', '1619651159')
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

      expect(res).to.have.status(403)
    })

    it('Should return 200 OK when a user posts multiple webhook events', async () => {
      process.env.SENDGRID_WEBHOOK_PUBLIC_KEY = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEQ4LIFtWztlsF7skFqOncjD1lun4H5w8XOhyOArHW9RcIx/FfEzx6cikC/yPfUvwaX/JScE7Fc9CJD2afQ9Ok3Q=='
      const res = await chai
        .request(app)
        .post('/api/webhooks/slack')
        .set('X-Twilio-Email-Event-Webhook-Signature', 'MEYCIQC/I4o6vCgqRYrTljjoVWB/GRWNtxeePlLMHr3x9ETeRQIhAIpV+03nREPTTHWSW0wIOA0EoMPdcNgXa70yCaqDJlu5')
        .set('X-Twilio-Email-Event-Webhook-Timestamp', '1619651159')
        .send([
          {
            email: 'invalid@gmail.com',
            event: 'processed',
            send_at: 0,
            sg_event_id: 'cHJvY2Vzc2VkLTE5OTQyMTEyLXFOd0JMZ1BRUWpXNkRKdktRd1NBYnctMA',
            sg_message_id: 'qNwBLgPQQjW6DJvKQwSAbw.filterdrecv-canary-547b64655b-cw6zx-1-6089EA4A-56.0',
            'smtp-id': '<qNwBLgPQQjW6DJvKQwSAbw@ismtpd0178p1mdw1.sendgrid.net>',
            timestamp: 1619651146
          },
          {
            email: 'invalid@gmail.com',
            event: 'bounce',
            ip: '167.89.101.76',
            reason: '552 5.2.2 The email account that you tried to reach is over quota and inactive. Please direct the recipient to https://support.google.com/mail/?p=OverQuotaPerm c17si1130468pgv.34 - gsmtp',
            sg_event_id: 'Ym91bmNlLTAtMTk5NDIxMTItcU53QkxnUFFRalc2REp2S1F3U0Fidy0w',
            sg_message_id: 'qNwBLgPQQjW6DJvKQwSAbw.filterdrecv-canary-547b64655b-cw6zx-1-6089EA4A-56.0',
            'smtp-id': '<qNwBLgPQQjW6DJvKQwSAbw@ismtpd0178p1mdw1.sendgrid.net>',
            status: '5.2.2',
            timestamp: 1619651147,
            tls: 1,
            type: 'blocked'
          }
        ])

      expect(res).to.have.status(200)
    })

    it('Should return 200 OK when a user posts a webhook event', async () => {
      process.env.SENDGRID_WEBHOOK_PUBLIC_KEY = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE83T4O/n84iotIvIW4mdBgQ/7dAfSmpqIM8kF9mN1flpVKS3GRqe62gw+2fNNRaINXvVpiglSI8eNEc6wEA3F+g=='
      const res = await chai
        .request(app)
        .post('/api/webhooks/slack')
        .set('X-Twilio-Email-Event-Webhook-Signature', 'MEUCIGHQVtGj+Y3LkG9fLcxf3qfI10QysgDWmMOVmxG0u6ZUAiEAyBiXDWzM+uOe5W0JuG+luQAbPIqHh89M15TluLtEZtM=')
        .set('X-Twilio-Email-Event-Webhook-Timestamp', '1600112502')
        .send([
          {
            email: 'hello@world.com',
            event: 'dropped',
            reason: 'Bounced Address',
            sg_event_id: 'ZHJvcC0xMDk5NDkxOS1MUnpYbF9OSFN0T0doUTRrb2ZTbV9BLTA',
            sg_message_id: 'LRzXl_NHStOGhQ4kofSm_A.filterdrecv-p3mdw1-756b745b58-kmzbl-18-5F5FC76C-9.0',
            'smtp-id': '<LRzXl_NHStOGhQ4kofSm_A@ismtpd0039p1iad1.sendgrid.net>',
            timestamp: 1600112492
          }
        ])

      expect(res).to.have.status(200)
    })
  })
})
