import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'

const { expect } = chai

chai.use(chaiHttp)

describe('App actions', () => {
  it('Should return 200 when favicon is requested', async () => {
    const res = await chai
      .request(app)
      .get('/favicon.ico')

    expect(res).to.have.status(200)
  })

  it('Should return 200 on the root route', async () => {
    const res = await chai
      .request(app)
      .get('/')

    expect(res).to.have.status(200)
    expect(res.body).to.include.keys('message', 'documentation')
    expect(res.body.message).to.equal('Welcome to the beginning of insanity')
    expect(res.body.documentation).to.equal('https://documenter.getpostman.com/view/5905120/VVBZQjLf')
  })

  it('Should return 404 when a non-existent route is requested', async () => {
    const res = await chai
      .request(app)
      .get('/nonexistent')

    expect(res).to.have.status(404)
    expect(res.body).to.include.keys('statusCode', 'success', 'errors')
    expect(res.body.errors.message).to.equal('Route not found')
    expect(res.body.success).to.equal(false)
  })
})
