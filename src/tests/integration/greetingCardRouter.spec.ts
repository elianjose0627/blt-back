import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  createVerifiedCompany
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string
let adminUserId: string

describe('Greeting card actions', () => {
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
    adminUserId = resAdmin.body.user.id
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Get all greeting cards', () => {
    it('Should return 200 Success when an admin successfully retrieves all greeting cards.', async () => {
      const res = await chai
        .request(app)
        .get('/api/greeting-cards')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'greetingCards')
      expect(res.body.greetingCards).to.be.an('array')
    })

    it('Should return 200 Success when an admin successfully retrieves all greeting cards with search.', async () => {
      await chai
        .request(app)
        .post('/api/greeting-cards')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          greetingCard: {
            articleNumber: '109999999999',
            articleName: 'Grußkarte - Indevis',
            jtlfpid: 'VZ9N01EQH85',
            url: 'https://firebasestorage.googleapis.com/v0/b/endeavor-b285f.appspot.com/o/cards%2Fgeneral%2FMotiv%2010%20Welcome.jpg?alt=media&token=REDACTED'
          }
        })

      const res = await chai
        .request(app)
        .get('/api/greeting-cards')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .query({
          limit: 10,
          page: 1,
          search: 'Staffbase'
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'greetingCards')
      expect(res.body.greetingCards).to.be.an('array')
    })

    it('Should return 200 Success when an admin successfully retrieves all greeting cards with filter.', async () => {
      const company = await createVerifiedCompany(adminUserId)
      const companyId = company.id
      await chai
        .request(app)
        .post('/api/greeting-cards')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          greetingCard: {
            articleNumber: '109999999999',
            articleName: 'Grußkarte - Indevis',
            jtlfpid: 'VZ9N01EQH85',
            url: 'https://firebasestorage.googleapis.com/v0/b/endeavor-b285f.appspot.com/o/cards%2Fgeneral%2FMotiv%2010%20Welcome.jpg?alt=media&token=REDACTED',
            companyId
          }
        })

      const res = await chai
        .request(app)
        .get('/api/greeting-cards')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .query({
          limit: 10,
          page: 1,
          'filter[companyId]': companyId
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'greetingCards')
      expect(res.body.greetingCards).to.be.an('array')
    })

    it('Should return 200 when a non-admin retrieves all greeting cards.', async () => {
      const res = await chai
        .request(app)
        .get('/api/greeting-cards')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'greetingCards')
      expect(res.body.greetingCards).to.be.an('array')
    })
  })

  describe('Create a greeting cards', () => {
    it('Should return 201 Created when an admin creates a greeting card.', async () => {
      const res = await chai
        .request(app)
        .post('/api/greeting-cards')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          greetingCard: {
            articleNumber: '100000000001',
            articleName: 'Grußkarte - Staffbase',
            jtlfpid: 'VZ9N01EQH85',
            url: 'https://firebasestorage.googleapis.com/v0/b/endeavor-b285f.appspot.com/o/cards%2Fgeneral%2FMotiv%2010%20Welcome.jpg?alt=media&token=REDACTED'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'greetingCard')
      expect(res.body.greetingCard).to.be.an('object')
      expect(res.body.greetingCard).to.include.keys('id', 'articleNumber', 'articleName', 'totalStock', 'inventory', 'availableStock', 'jtlfpid', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a user creates the same greeting card.', async () => {
      const res = await chai
        .request(app)
        .post('/api/greeting-cards')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          greetingCard: {
            articleNumber: '100000000001',
            articleName: 'Grußkarte - Staffbase',
            jtlfpid: 'VZ9N01EQH85',
            url: 'https://firebasestorage.googleapis.com/v0/b/endeavor-b285f.appspot.com/o/cards%2Fgeneral%2FMotiv%2010%20Welcome.jpg?alt=media&token=REDACTED'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'greetingCard')
      expect(res.body.greetingCard).to.be.an('object')
      expect(res.body.greetingCard).to.include.keys('id', 'articleNumber', 'articleName', 'totalStock', 'inventory', 'availableStock', 'jtlfpid', 'createdAt', 'updatedAt')
    })

    it('Should return 204 when a admin deletes a greeting card.', async () => {
      const resGreetingCard = await chai
        .request(app)
        .post('/api/greeting-cards')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          greetingCard: {
            articleNumber: '100000000001',
            articleName: 'Grußkarte - Staffbase',
            jtlfpid: 'VZ9N01EQH85',
            url: 'https://firebasestorage.googleapis.com/v0/b/endeavor-b285f.appspot.com/o/cards%2Fgeneral%2FMotiv%2010%20Welcome.jpg?alt=media&token=REDACTED'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/greeting-cards/${String(resGreetingCard.body.greetingCard.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a greeting card that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/greeting-cards/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('GreetingCard not found')
    })
  })

  describe('Get, update and delete a greeting card', () => {
    it('Should return 200 OK when an owner gets a greeting card by id.', async () => {
      const resGreetingCard = await chai
        .request(app)
        .post('/api/greeting-cards')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          greetingCard: {
            articleNumber: '100000000001',
            articleName: 'Grußkarte - Staffbase',
            jtlfpid: 'VZ9N01EQH85',
            url: 'https://firebasestorage.googleapis.com/v0/b/endeavor-b285f.appspot.com/o/cards%2Fgeneral%2FMotiv%2010%20Welcome.jpg?alt=media&token=REDACTED'
          }
        })

      const greetingCardId = resGreetingCard.body.greetingCard.id

      const res = await chai
        .request(app)
        .get(`/api/greeting-cards/${String(greetingCardId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'greetingCard')
      expect(res.body.greetingCard).to.be.an('object')
      expect(res.body.greetingCard).to.include.keys('id', 'articleNumber', 'articleName', 'totalStock', 'inventory', 'availableStock', 'jtlfpid', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator gets a greeting card by id.', async () => {
      const resGreetingCard = await chai
        .request(app)
        .post('/api/greeting-cards')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          greetingCard: {
            articleNumber: '100000000001',
            articleName: 'Grußkarte - Staffbase',
            jtlfpid: 'VZ9N01EQH85',
            url: 'https://firebasestorage.googleapis.com/v0/b/endeavor-b285f.appspot.com/o/cards%2Fgeneral%2FMotiv%2010%20Welcome.jpg?alt=media&token=REDACTED'
          }
        })

      const greetingCardId = resGreetingCard.body.greetingCard.id

      const res = await chai
        .request(app)
        .get(`/api/greeting-cards/${String(greetingCardId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'greetingCard')
      expect(res.body.greetingCard).to.be.an('object')
      expect(res.body.greetingCard).to.include.keys('id', 'articleNumber', 'articleName', 'totalStock', 'inventory', 'availableStock', 'jtlfpid', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an administrator updates a greeting card by id.', async () => {
      const resGreetingCard = await chai
        .request(app)
        .post('/api/greeting-cards')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          greetingCard: {
            articleNumber: '100000000001',
            articleName: 'Grußkarte - Staffbase',
            jtlfpid: 'VZ9N01EQH85',
            url: 'https://firebasestorage.googleapis.com/v0/b/endeavor-b285f.appspot.com/o/cards%2Fgeneral%2FMotiv%2010%20Welcome.jpg?alt=media&token=REDACTED'
          }
        })

      const greetingCardId = resGreetingCard.body.greetingCard.id

      const res = await chai
        .request(app)
        .put(`/api/greeting-cards/${String(greetingCardId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          greetingCard: {
            articleNumber: '100000000001',
            articleName: 'Grußkarte - Staffbase Updated',
            jtlfpid: 'VZ9N01EQH85',
            url: 'https://firebasestorage.googleapis.com/v0/b/endeavor-b285f.appspot.com/o/cards%2Fgeneral%2FMotiv%2010%20Welcome.jpg?alt=media&token=REDACTED'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'greetingCard')
      expect(res.body.greetingCard).to.be.an('object')
      expect(res.body.greetingCard).to.include.keys('id', 'articleNumber', 'articleName', 'totalStock', 'inventory', 'availableStock', 'jtlfpid', 'createdAt', 'updatedAt')
      expect(res.body.greetingCard.articleName).to.equal('Grußkarte - Staffbase Updated')
    })

    it('Should return 403 Forbidden when an non-administrator tries to update a greeting card by id.', async () => {
      const resGreetingCard = await chai
        .request(app)
        .post('/api/greeting-cards')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          greetingCard: {
            articleNumber: '100000000001',
            articleName: 'Grußkarte - Staffbase',
            jtlfpid: 'VZ9N01EQH85',
            url: 'https://firebasestorage.googleapis.com/v0/b/endeavor-b285f.appspot.com/o/cards%2Fgeneral%2FMotiv%2010%20Welcome.jpg?alt=media&token=REDACTED'
          }
        })

      const greetingCardId = resGreetingCard.body.greetingCard.id

      const res = await chai
        .request(app)
        .put(`/api/greeting-cards/${String(greetingCardId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          greetingCard: {
            articleNumber: '100000000001',
            articleName: 'Grußkarte - Staffbase Updated',
            jtlfpid: 'VZ9N01EQH85',
            url: 'https://firebasestorage.googleapis.com/v0/b/endeavor-b285f.appspot.com/o/cards%2Fgeneral%2FMotiv%2010%20Welcome.jpg?alt=media&token=REDACTED'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 200 OK when an administrator deletes a greeting card by id.', async () => {
      const resGreetingCard = await chai
        .request(app)
        .post('/api/greeting-cards')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          greetingCard: {
            articleNumber: '100000000001',
            articleName: 'Grußkarte - Staffbase',
            jtlfpid: 'VZ9N01EQH85',
            url: 'https://firebasestorage.googleapis.com/v0/b/endeavor-b285f.appspot.com/o/cards%2Fgeneral%2FMotiv%2010%20Welcome.jpg?alt=media&token=REDACTED'
          }
        })

      const greetingCardId = resGreetingCard.body.greetingCard.id

      const res = await chai
        .request(app)
        .delete(`/api/greeting-cards/${String(greetingCardId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when an non-administrator tries to delete a greeting card by id.', async () => {
      const resGreetingCard = await chai
        .request(app)
        .post('/api/greeting-cards')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          greetingCard: {
            articleNumber: '100000000001',
            articleName: 'Grußkarte - Staffbase',
            jtlfpid: 'VZ9N01EQH85',
            url: 'https://firebasestorage.googleapis.com/v0/b/endeavor-b285f.appspot.com/o/cards%2Fgeneral%2FMotiv%2010%20Welcome.jpg?alt=media&token=REDACTED'
          }
        })

      const greetingCardId = resGreetingCard.body.greetingCard.id

      const res = await chai
        .request(app)
        .delete(`/api/greeting-cards/${String(greetingCardId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })

  describe('Print Greeting Card Actions', () => {
    xit('Should return 200 OK when an admin successfully triggers a greeting card email for a campaign.', async () => {
      const res = await chai
        .request(app)
        .post('/api/greeting-cards/print')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          print: {
            htmlText: "<h1>Hello, [firstname] [salutation]!</h1><p>This is some HTML content on the second page. Hello python my old friend. You have been a saviour, That's gotta be weird. I told you</p><p>Regards,<br/>[lastname]</p>",
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/endeavor-b285f.appspot.com/o/cards%2Fgeneral%2FMotiv%203%20Hamburg.jpg?alt=media&token=REDACTED',
            placeholders: {
              salutation: 'Mr',
              firstname: 'Ryan',
              lastname: 'Wire'
            },
            frontOrientation: 'landscape',
            backOrientation: 'landscape',
            email: {
              to: 'ryanwiretest@gmail.com',
              from: 'support@biglittlethings.de',
              subject: 'PDF Attachment',
              text: 'Attached is the PDF file.'
            },
            exportSides: 'both'
          }
        })

      expect(res).to.have.status(200)
    })

    xit('Should return 200 OK when an admin successfully triggers a portrait greeting card email for a campaign.', async () => {
      const res = await chai
        .request(app)
        .post('/api/greeting-cards/print')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          print: {
            htmlText: "<h1>Hello, [firstname] [salutation]!</h1><p>This is some HTML content on the second page. Hello python my old friend. You have been a saviour, That's gotta be weird. I told you</p><p>Regards,<br/>[lastname]</p>",
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/endeavor-b285f.appspot.com/o/cards%2Fgeneral%2FMotiv%203%20Hamburg.jpg?alt=media&token=REDACTED',
            placeholders: {
              salutation: 'Mr',
              firstname: 'Ryan',
              lastname: 'Wire'
            },
            email: {
              to: 'ryanwiretest@gmail.com',
              from: 'support@biglittlethings.de',
              subject: 'PDF Attachment',
              text: 'Attached is the PDF file.'
            }
          }
        })

      expect(res).to.have.status(200)
    })
  })
})
