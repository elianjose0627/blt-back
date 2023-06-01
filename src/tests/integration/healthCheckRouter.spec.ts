import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'

const { expect } = chai

chai.use(chaiHttp)

describe('Health Check actions', () => {
  describe('Get a health check', () => {
    it('Should return 200 OK when a user gets a health check.', async () => {
      const res = await chai
        .request(app)
        .get('/api/health-checks')

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'healthcheck')
      expect(res.body.healthcheck).to.be.an('object')
      expect(res.body.healthcheck).to.include.keys('uptime', 'message', 'timestamp')
    })
  })
})
