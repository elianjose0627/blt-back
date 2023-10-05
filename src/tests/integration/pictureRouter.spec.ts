import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  createVerifiedCompany
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let userIdAdmin: string

describe('Picture actions', () => {
  before(async () => {
    await createAdminTestUser()

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: 'thebiggun' } })

    tokenAdmin = resAdmin.body.token
    userIdAdmin = resAdmin.body.user.id
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Delete a picture', () => {
    it('Should return 204 No Content when a user deletes a picture.', async () => {
      const resCompany = await createVerifiedCompany(userIdAdmin)
      const companyId = String(resCompany.id)

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const resBundle = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/bundles`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          bundle: {
            merchantSku: '39262696145050',
            name: 'Staffbase Bundle 1',
            specifications: {
              billOfMaterialsComponents: [
                {
                  jfsku: '26CJ0114JWR',
                  merchantSku: 'ART2394871',
                  name: 'Interdimensional Goggles'
                }
              ]
            }
          }
        })

      const resPicture = await chai
        .request(app)
        .post(`/api/bundles/${String(resBundle.body.bundle.id)}/pictures`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          picture: {
            url: 'https://google.com/image.jpg',
            filename: 'image.jpg',
            size: 12,
            mimeType: 'image/jpeg'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/pictures/${String(resPicture.body.picture.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })
  })

  describe('Get greeting cards', () => {
    it('Should return 200 OK when a user gets all cards from firebase.', async () => {
      const res = await chai
        .request(app)
        .get('/api/pictures/cards')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'meta', 'cards')
      expect(res.body.cards).to.be.an('array')
    })

    it('Should return 200 OK when a user gets cards filtered by company from firebase.', async () => {
      const res = await chai
        .request(app)
        .get('/api/pictures/cards')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .query({
          'filter[companyId]': 'd2c45740-f4c9-11ed-a7f1-f1608468d9ae'
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'meta', 'cards')
      expect(res.body.cards).to.be.an('array')
    })

    it('Should return 200 OK when a user gets all cards from firebase with pagination.', async () => {
      const res = await chai
        .request(app)
        .get('/api/pictures/cards')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .query({
          limit: 1
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'meta', 'cards')
      expect(res.body.cards).to.be.an('array')
    })
  })
})
