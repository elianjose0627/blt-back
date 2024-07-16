import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  verifyCompanyDomain,
  iversAtKreeDotKrPassword,
  sheHulkAtStarkIndustriesPassword
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string

describe('Bundle actions', () => {
  before(async () => {
    await createAdminTestUser()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustriesmarvel.com', phone: '254720123456', password: sheHulkAtStarkIndustriesPassword } })

    await verifyUser('shehulk@starkindustriesmarvel.com')

    const resUser = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: sheHulkAtStarkIndustriesPassword } })

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: iversAtKreeDotKrPassword } })

    tokenAdmin = resAdmin.body.token
    token = resUser.body.token
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Bundles Actions', () => {
    it('Should return 200 Success when a user successfully retrieves a bundle by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel Two',
            email: 'test2@companymarveltwo.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
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

      const res = await chai
        .request(app)
        .get(`/api/bundles/${String(resBundle.body.bundle.id)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'bundle')
      expect(res.body.bundle).to.be.an('object')
    })

    it('Should return 200 Success when an admin successfully retrieves a bundle by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel Kenya',
            email: 'testke@companymarvel.ke'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
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

      const res = await chai
        .request(app)
        .get(`/api/bundles/${String(resBundle.body.bundle.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'bundle')
      expect(res.body.bundle).to.be.an('object')
    })

    it('Should return 201 Created when an admin successfully posts a picture.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel Nairobi',
            email: 'testke@companymarvelnairobi.ke'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
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

      const res = await chai
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

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'picture')
      expect(res.body.picture).to.be.an('object')
    })

    it('Should return 200 OK when an admin tries to post the same picture.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel Nakuru',
            email: 'testke@companymarvelnakuru.ke'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
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

      await chai
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

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'picture')
      expect(res.body.picture).to.be.an('object')
    })
  })
})
