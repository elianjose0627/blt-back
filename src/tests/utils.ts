import { v1 as uuidv1, v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import db from '../models'
import * as userRoles from '../utils/userRoles'

import utc from 'dayjs/plugin/utc'
import type { Module, Role } from '../types'
dayjs.extend(utc)

export const deleteTestUser = async (email: string): Promise<any> => {
  const user = await db.User.findOne({
    attributes: ['id', 'email'],
    where: {
      email
    }
  })

  if (user !== null) {
    await user.destroy({ force: true })
    return null
  }
}

export const createAdminTestUser = async (email = 'ivers@kree.kr', password = 'thebiggun'): Promise<any> => {
  const user = await db.User.findOne({
    attributes: ['id', 'email'],
    where: {
      email
    }
  })

  if (user === null) {
    const user = await db.User.create({
      id: uuidv1(),
      firstName: 'Carol',
      lastName: 'Danvers',
      email,
      role: userRoles.ADMIN,
      phone: '1111111111',
      password,
      isVerified: true
    })

    if (user !== null) {
      return user
    }
  }
}

export const createTestUser = async (email = 'drstrange@starkindustriesmarvel.com', password = 'thesanctum'): Promise<any> => {
  const user = await db.User.create({
    id: uuidv1(),
    firstName: 'Steven',
    lastName: 'Strange',
    email,
    phone: '2222222222',
    password,
    isVerified: true
  })

  if (user !== null) {
    return user
  }
}

export const createUnverifiedUser = async (): Promise<any> => {
  const user = await db.User.create({
    id: uuidv1(),
    firstName: 'Harry',
    lastName: 'Houdini',
    email: 'hh@starkindustriesmarvel.com',
    phone: '2222222222',
    password: 'thegrandwizard',
    isVerified: false
  })

  if (user !== null) {
    return user
  }
}

export const createBlockedUser = async (): Promise<any> => {
  const user = await db.User.create({
    id: uuidv1(),
    firstName: 'Wanda',
    lastName: 'Maximoff',
    email: 'wandamaximoff@avengers.com',
    phone: '2222222222',
    password: 'thescarletwitch',
    isVerified: true,
    isActive: false
  })

  if (user !== null) {
    return user
  }
}

export const createCampaignManager = async (email = 'happyhogan@starkindustriesmarvel.com', password = 'pepperpotts'): Promise<any> => {
  const user = await db.User.findOne({
    attributes: ['id', 'email'],
    where: {
      email
    }
  })

  if (user === null) {
    const user = await db.User.create({
      id: uuidv1(),
      firstName: 'Happy',
      lastName: 'Hogan',
      email,
      role: userRoles.CAMPAIGNMANAGER,
      phone: '1111111111',
      password,
      isVerified: true
    })

    if (user !== null) {
      return user
    }
  }
}

export const createCompanyAdministrator = async (email = 'nickfury@starkindustriesmarvel.com', password = 'captainmarvel'): Promise<any> => {
  const user = await db.User.findOne({
    attributes: ['id', 'email'],
    where: {
      email
    }
  })

  if (user === null) {
    const user = await db.User.create({
      id: uuidv1(),
      firstName: 'Nick',
      lastName: 'Fury',
      email,
      role: userRoles.COMPANYADMINISTRATOR,
      phone: '1111111111',
      password,
      isVerified: true
    })

    if (user !== null) {
      const company = await db.Company.create({
        id: uuidv1(),
        name: 'Test Company',
        userId: user.id,
        email
      })

      await user.update({ companyId: company.id })
      return user
    }
  }
}

export const createCompanyAdministratorWithCompany = async (email = 'sharoncarter@starkindustriesmarvel.com', password = 'thepowerbroker'): Promise<any> => {
  const user = await db.User.findOne({
    attributes: ['id', 'email'],
    where: {
      email
    }
  })

  if (user === null) {
    const user = await db.User.create({
      id: uuidv1(),
      firstName: 'Sharon',
      lastName: 'Carter',
      email,
      role: userRoles.COMPANYADMINISTRATOR,
      phone: '1111111111',
      password,
      isVerified: true
    })

    if (user !== null) {
      const company = await db.Company.create({
        id: uuidv1(),
        name: 'Test Company',
        userId: user.id,
        email
      })

      await user.update({ companyId: company.id })
      return user
    }
  }
}

export const createUnverifiedAdmin = async (): Promise<any> => {
  const user = await db.User.create({
    id: uuidv1(),
    firstName: 'Trish',
    lastName: 'Walker',
    email: 'trishwalker@aliasinvestigationsmarvel.com',
    phone: '2222222222',
    password: 'jessicajones',
    isVerified: false,
    isActive: true,
    role: userRoles.ADMIN
  })

  if (user !== null) {
    return user
  }
}

export const createLockedOutUser30mins = async (): Promise<any> => {
  const user = await db.User.create({
    id: uuidv1(),
    firstName: 'Monica',
    lastName: 'Rambeau',
    email: 'monicarambeau@swordmarvel.com',
    phone: '2222222222',
    password: 'photonroxx',
    isVerified: true,
    loginTime: {
      lastSuccessful: null,
      lastFailed: dayjs.utc(),
      failed: 5
    }
  })

  if (user !== null) {
    return user
  }
}

export const createLockedOutUser1min = async (): Promise<any> => {
  const user = await db.User.create({
    id: uuidv1(),
    firstName: 'Maria',
    lastName: 'Rambeau',
    email: 'mariarambeau@swordmarvel.com',
    phone: '2222222222',
    password: 'photonroxx',
    isVerified: true,
    loginTime: {
      lastSuccessful: null,
      lastFailed: dayjs.utc().subtract(29, 'minutes'),
      failed: 5
    }
  })

  if (user !== null) {
    return user
  }
}

export const createUserWithOtp = async (): Promise<any> => {
  const user = await db.User.create({
    id: uuidv1(),
    firstName: 'Thena',
    lastName: 'Eternal',
    email: 'thenaeternal@celestialmarvel.com',
    phone: '2222222222',
    password: 'kingo123',
    isVerified: true,
    otp: {
      createdAt: dayjs.utc(),
      value: 123456
    }
  })

  if (user !== null) {
    return user
  }
}

export const createUserWithExpiredOtp = async (): Promise<any> => {
  const user = await db.User.create({
    id: uuidv1(),
    firstName: 'Sersi',
    lastName: 'Eternal',
    email: 'sersieternal@celestialmarvel.com',
    phone: '2222222222',
    password: 'icarussux',
    isVerified: true,
    otp: {
      createdAt: dayjs.utc().subtract(3, 'minute'),
      value: 123456
    }
  })

  if (user !== null) {
    return user
  }
}

export const createVerifiedUser = async (email = 'mantis@aguardiansofthegalaxy.com', password = 'quill'): Promise<any> => {
  const user = await db.User.create({
    id: uuidv1(),
    firstName: 'Mantis',
    lastName: 'Ego',
    email,
    phone: '2222222222',
    password,
    isVerified: true,
    isActive: true,
    role: userRoles.USER
  })

  if (user !== null) {
    return user
  }
}

export const createVerifiedAdminUser = async (): Promise<any> => {
  const user = await db.User.create({
    id: uuidv1(),
    firstName: 'Drax',
    lastName: 'Drax',
    email: 'drax@aguardiansofthegalaxy.com',
    phone: '2222222222',
    password: 'peterquill',
    isVerified: true,
    isActive: true,
    role: userRoles.ADMIN
  })

  if (user !== null) {
    return user
  }
}

export const createVerifiedCompany = async (userId: string, isDomainVerified = true): Promise<any> => {
  const company = await db.Company.create({
    id: uuidv1(),
    name: 'Stark Industries',
    email: 'admin@starkindustriesmarvel.com',
    domain: 'starkindustriesmarvel.com',
    isDomainVerified,
    userId
  })

  const updatedCompany = company.update({ isDomainVerified })

  if (updatedCompany !== null) {
    return updatedCompany
  }
}

export const createUnVerifiedCompanyWithExpiredDomainCode = async (userId: string): Promise<any> => {
  const uuid = uuidv4()
  const company = await db.Company.create({
    id: uuidv1(),
    name: 'Test Company',
    email: 'admin@testcompanyfour.com',
    domain: 'testcompanyfour.com',
    isDomainVerified: false,
    userId
  })

  const updatedCompany = company.update({
    domainVerificationCode: {
      createdAt: dayjs.utc().subtract(8, 'days'),
      value: `biglittlethings-domain-verification=${uuidv4().substring(uuid.length - 12)}`
    }
  })

  if (updatedCompany !== null) {
    return updatedCompany
  }
}

export const verifyUser = async (email: string): Promise<any> => {
  const user = await db.User.findOne({
    where: {
      email
    }
  })

  if (user !== null) {
    await user.update({
      isVerified: true
    })
  }
}

export const verifyCompanyDomain = async (id: string): Promise<any> => {
  const company = await db.Company.findOne({
    where: {
      id
    }
  })

  if (company !== null) {
    await company.update({
      isDomainVerified: true
    })
  }
}

export const order = {
  outboundId: 'VZ9N02A3Y4',
  fulfillerId: 'NDZ2',
  merchantOutboundNumber: 'AU-2023-21635-001',
  warehouseId: 'NDZ204DE-12589-0002',
  status: 'Acknowledged',
  shippingAddress: {
    lastname: 'Wire',
    city: 'Nairobi',
    email: 'rayosim09@gmail.com',
    firstname: 'Ryan',
    street: 'Kiu River Road',
    zip: '254724374281',
    country: 'KE'
  },
  items: [
    {
      jfsku: 'VZ9N01SJN9E',
      outboundItemId: '222495',
      name: 'Zeppelin Box - Apriil 2023',
      merchantSku: '1552',
      quantity: 1,
      itemType: 'BillOfMaterials',
      quantityOpen: 1,
      externalNumber: '',
      price: 0,
      vat: 19
    },
    {
      jfsku: 'VZ9N016LAW1',
      outboundItemId: '222496',
      name: 'Rettergut - Schokolade - Dark Milk',
      merchantSku: '245',
      quantity: 1,
      itemType: 'Product',
      quantityOpen: 1,
      externalNumber: '',
      price: 0,
      vat: 0,
      billOfMaterialsId: '222495'
    },
    {
      jfsku: 'VZ9N019D762',
      outboundItemId: '222497',
      name: 'Heimatgut - Bio Popcorn Zimt',
      merchantSku: '324',
      quantity: 1,
      itemType: 'Product',
      quantityOpen: 1,
      externalNumber: '',
      price: 0,
      vat: 0,
      billOfMaterialsId: '222495'
    },
    {
      jfsku: 'VZ9N019TCQE',
      outboundItemId: '222498',
      name: 'Grußkarte - Zeppelin',
      merchantSku: '999400000001',
      quantity: 1,
      itemType: 'Product',
      quantityOpen: 1,
      externalNumber: '',
      price: 0,
      vat: 0,
      billOfMaterialsId: '222495'
    },
    {
      jfsku: 'VZ9N015EGTB',
      outboundItemId: '222499',
      name: 'Kartonage - Zeppelin',
      merchantSku: '000000000016',
      quantity: 1,
      itemType: 'Product',
      quantityOpen: 1,
      externalNumber: '',
      price: 0,
      vat: 0,
      billOfMaterialsId: '222495'
    },
    {
      jfsku: 'VZ9N01EQJ3X',
      outboundItemId: '222500',
      name: 'Notizbuch - Corknote - 1c - kork - Zeppelin',
      merchantSku: '777',
      quantity: 1,
      itemType: 'Product',
      quantityOpen: 1,
      externalNumber: '',
      price: 0,
      vat: 0,
      billOfMaterialsId: '222495'
    },
    {
      jfsku: 'VZ9N01LYRMJ',
      outboundItemId: '222501',
      name: 'Kugelschreiber - Sumatra - laser - Zeppelin',
      merchantSku: '778',
      quantity: 1,
      itemType: 'Product',
      quantityOpen: 1,
      externalNumber: '',
      price: 0,
      vat: 0,
      billOfMaterialsId: '222495'
    },
    {
      jfsku: 'VZ9N014DZ4U',
      outboundItemId: '222502',
      name: 'Antistressball - 1c- white - Zeppelin',
      merchantSku: '780',
      quantity: 1,
      itemType: 'Product',
      quantityOpen: 1,
      externalNumber: '',
      price: 0,
      vat: 0,
      billOfMaterialsId: '222495'
    },
    {
      jfsku: 'VZ9N01RFJSG',
      outboundItemId: '222503',
      name: 'Füllmaterial - Natur ',
      merchantSku: '1341',
      quantity: 1,
      itemType: 'Product',
      quantityOpen: 1,
      externalNumber: '',
      price: 0,
      vat: 0,
      billOfMaterialsId: '222495'
    },
    {
      jfsku: 'VZ9N018R1P3',
      outboundItemId: '222504',
      name: 'Pflanzwürfel - Riesenbambus - Zeppelin',
      merchantSku: '1484',
      quantity: 1,
      itemType: 'Product',
      quantityOpen: 1,
      externalNumber: '',
      price: 0,
      vat: 0,
      billOfMaterialsId: '222495'
    },
    {
      jfsku: 'VZ9N01JY2YR',
      outboundItemId: '222505',
      name: 'Toolie+ - laser - Zeppelin',
      merchantSku: '1495',
      quantity: 1,
      itemType: 'Product',
      quantityOpen: 1,
      externalNumber: '',
      price: 0,
      vat: 0,
      billOfMaterialsId: '222495'
    }
  ],
  senderAddress: {
    company: 'big little things GmbH',
    city: 'München',
    email: 'hello@biglittlethings.de',
    street: 'Kaufingerstraße 15',
    zip: '80331',
    country: 'DE',
    phone: '(089) 2009 2033'
  },
  attributes: [
    {
      key: 'Firma',
      value: 'Zeppelin GmbH',
      attributeType: 'String'
    },
    {
      key: 'Vorname',
      value: 'Katrin',
      attributeType: 'String'
    },
    {
      key: 'Nachname',
      value: 'Banks',
      attributeType: 'String'
    },
    {
      key: 'Straße',
      value: 'Graf-Zeppelin-Platz 1',
      attributeType: 'String'
    },
    {
      key: 'PLZ',
      value: '85748',
      attributeType: 'String'
    },
    {
      key: 'Ort',
      value: 'Garching bei München',
      attributeType: 'String'
    },
    {
      key: 'Land',
      value: 'Deutschland',
      attributeType: 'String'
    },
    {
      key: 'E-Mail-Adresse',
      value: 'hello@biglittlethings.de',
      attributeType: 'String'
    }
  ],
  priority: 0,
  currency: 'EUR',
  externalNote: 'Mit DHL versenden. Versanddatum: 20.04.2023',
  salesChannel: 'XML-Import',
  desiredDeliveryDate: '2023-04-19T22:00:00.000+00:00',
  shippingMethodId: 'NDZ20AAFC64A2SER',
  shippingType: 'Standard',
  shippingFee: 0,
  orderValue: 0,
  attachments: []
}

export const orderTwo = {
  outboundId: 'VZ9N02A3ZX',
  fulfillerId: 'NDZ2',
  merchantOutboundNumber: 'AU-2023-21636-001',
  warehouseId: 'NDZ204DE-12589-0002',
  status: 'Acknowledged',
  shippingAddress: {
    lastname: 'Wire',
    city: 'Nairobi',
    email: 'rayosim09@gmail.com',
    firstname: 'Ryan',
    street: 'Kiu River Road',
    zip: '254724374281',
    country: 'KE'
  },
  items: [
    {
      jfsku: 'VZ9N01SJN9E',
      outboundItemId: '222495',
      name: 'Zeppelin Box - Apriil 2023',
      merchantSku: '1552',
      quantity: 1,
      itemType: 'BillOfMaterials',
      quantityOpen: 1,
      externalNumber: '',
      price: 0,
      vat: 19
    },
    {
      jfsku: 'VZ9N016LAW1',
      outboundItemId: '222496',
      name: 'Rettergut - Schokolade - Dark Milk',
      merchantSku: '245',
      quantity: 1,
      itemType: 'Product',
      quantityOpen: 1,
      externalNumber: '',
      price: 0,
      vat: 0,
      billOfMaterialsId: '222495'
    }
  ],
  senderAddress: {
    company: 'big little things GmbH',
    city: 'München',
    email: 'hello@biglittlethings.de',
    street: 'Kaufingerstraße 15',
    zip: '80331',
    country: 'DE',
    phone: '(089) 2009 2033'
  },
  attributes: [
    {
      key: 'Firma',
      value: 'Zeppelin GmbH',
      attributeType: 'String'
    },
    {
      key: 'Vorname',
      value: 'Katrin',
      attributeType: 'String'
    },
    {
      key: 'Nachname',
      value: 'Banks',
      attributeType: 'String'
    },
    {
      key: 'Straße',
      value: 'Graf-Zeppelin-Platz 1',
      attributeType: 'String'
    },
    {
      key: 'PLZ',
      value: '85748',
      attributeType: 'String'
    },
    {
      key: 'Ort',
      value: 'Garching bei München',
      attributeType: 'String'
    },
    {
      key: 'Land',
      value: 'Deutschland',
      attributeType: 'String'
    },
    {
      key: 'E-Mail-Adresse',
      value: 'hello@biglittlethings.de',
      attributeType: 'String'
    }
  ],
  priority: 0,
  currency: 'EUR',
  externalNote: 'Mit DHL versenden. Versanddatum: 20.04.2023',
  salesChannel: 'XML-Import',
  desiredDeliveryDate: '2023-04-19T22:00:00.000+00:00',
  shippingMethodId: 'NDZ20AAFC64A2SER',
  shippingType: 'Standard',
  shippingFee: 0,
  orderValue: 0,
  attachments: []
}

export const orderThree = {
  outboundId: 'VZ9N02A3ZX',
  fulfillerId: 'NDZ2',
  merchantOutboundNumber: 'AU-2023-21636-001',
  warehouseId: 'NDZ204DE-12589-0002',
  status: 'Acknowledged',
  shippingAddress: {
    lastname: 'Wire',
    city: 'Nairobi',
    email: 'rayosim09@gmail.com',
    firstname: 'Ryan',
    street: 'Kiu River Road',
    zip: '254724374281'
  },
  items: [
    {
      jfsku: 'VZ9N01SJN9E',
      outboundItemId: '222495',
      name: 'Zeppelin Box - Apriil 2023',
      merchantSku: '1552',
      quantity: 1,
      itemType: 'BillOfMaterials',
      quantityOpen: 1,
      externalNumber: '',
      price: 0,
      vat: 19
    },
    {
      jfsku: 'VZ9N016LAW1',
      outboundItemId: '222496',
      name: 'Rettergut - Schokolade - Dark Milk',
      merchantSku: '245',
      quantity: 1,
      itemType: 'Product',
      quantityOpen: 1,
      externalNumber: '',
      price: 0,
      vat: 0,
      billOfMaterialsId: '222495'
    }
  ],
  senderAddress: {
    company: 'big little things GmbH',
    city: 'München',
    email: 'hello@biglittlethings.de',
    street: 'Kaufingerstraße 15',
    zip: '80331',
    country: 'DE',
    phone: '(089) 2009 2033'
  },
  attributes: [
    {
      key: 'Firma',
      value: 'Zeppelin GmbH',
      attributeType: 'String'
    },
    {
      key: 'Vorname',
      value: 'Katrin',
      attributeType: 'String'
    },
    {
      key: 'Nachname',
      value: 'Banks',
      attributeType: 'String'
    },
    {
      key: 'Straße',
      value: 'Graf-Zeppelin-Platz 1',
      attributeType: 'String'
    },
    {
      key: 'PLZ',
      value: '85748',
      attributeType: 'String'
    },
    {
      key: 'Ort',
      value: 'Garching bei München',
      attributeType: 'String'
    },
    {
      key: 'Land',
      value: 'Deutschland',
      attributeType: 'String'
    },
    {
      key: 'E-Mail-Adresse',
      value: 'hello@biglittlethings.de',
      attributeType: 'String'
    }
  ],
  priority: 0,
  currency: 'EUR',
  externalNote: 'Mit DHL versenden. Versanddatum: 20.04.2023',
  salesChannel: 'XML-Import',
  desiredDeliveryDate: '2023-04-19T22:00:00.000+00:00',
  shippingMethodId: 'NDZ20AAFC64A2SER',
  shippingType: 'Standard',
  shippingFee: 0,
  orderValue: 0,
  attachments: []
}

export const createPrivacyRule = async (companyId: string, module: Module, role: Role): Promise<any> => {
  const privacyRule = await db.PrivacyRule.create({
    id: uuidv1(),
    module,
    role,
    isEnabled: true,
    companyId
  })

  return privacyRule
}

export const createCompanyOrder = async (companyId: string): Promise<any> => {
  const res = await db.Order.create({
    ...order,
    outboundId: 'VZ9N02A3Y5',
    id: uuidv1(),
    companyId
  })

  return res
}

export const createCompanyOrderWithMinimalShippingAddress = async (companyId: string): Promise<any> => {
  const res = await db.Order.create({
    ...orderThree,
    outboundId: 'VZ9N02B3Y0',
    id: uuidv1(),
    companyId
  })

  return res
}

export const createCompanyOrderWithMissingEmail = async (companyId: string): Promise<any> => {
  const res = await db.Order.create({
    ...order,
    outboundId: 'VZ9N02A3Y7',
    id: uuidv1(),
    shippingAddress: {
      lastname: 'Wire',
      city: 'Nairobi',
      firstname: 'Ryan',
      street: 'Kiu River Road',
      zip: '254724374281',
      country: 'KE'
    },
    companyId
  })

  return res
}

export const createCompanyOrderWithMissingCityStreetZip = async (companyId: string): Promise<any> => {
  const res = await db.Order.create({
    ...order,
    outboundId: 'VZ9N02A3X7',
    id: uuidv1(),
    shippingAddress: {
      lastname: 'Wire',
      firstname: 'Ryan',
      email: 'ryanwire@email.com',
      country: 'KE'
    },
    companyId
  })

  return res
}

export const updatePendingOrderWithPostedOrderId = async (id: string, postedOrderId: string): Promise<any> => {
  const pendingOrder = await db.PendingOrder.findOne({
    where: {
      id
    }
  })

  if (pendingOrder !== null) {
    await pendingOrder.update({
      postedOrderId
    })
  }
}

export const pendingOrders = [
  {
    costCenter: '',
    platform: 0,
    language: 0,
    currency: 'EUR',
    orderNo: '0',
    inetorderno: 0,
    shippingId: 21,
    shipped: '2023-07-28 10:35:11.0000000',
    deliverydate: '2023-07-31 10:35:11.0000000',
    note: '',
    description: ' +',
    paymentType: 0,
    paymentTarget: 0,
    discount: 0.00,
    orderStatus: 0,
    orderLineRequests: [
      {
        itemName: 'Welcome Box - Techstarter',
        articleNumber: '1498',
        itemNetSale: 0.00,
        itemVAT: 0.00,
        quantity: 1,
        type: 0,
        discount: 0.00,
        netPurchasePrice: 0.00
      }
    ],
    shippingAddressRequests: [
      {
        salutation: 'Mr',
        firstName: 'Felix',
        lastName: 'Ixkes',
        title: '',
        company: '',
        companyAddition: '',
        street: 'Flügelstraße 6',
        addressAddition: '',
        zipCode: '40227',
        place: 'Düsseldorf',
        phone: '',
        state: '',
        country: 'Germany',
        iso: '',
        telephone: '',
        mobile: '',
        fax: '',
        email: 'christoph@biglittlethings.de'
      }
    ]
  },
  {
    costCenter: '',
    platform: 0,
    language: 0,
    currency: 'EUR',
    orderNo: '0',
    inetorderno: 0,
    shippingId: 21,
    shipped: '2023-07-28 10:35:11.0000000',
    deliverydate: '2023-07-31 10:35:11.0000000',
    note: '',
    description: ' +',
    paymentType: 0,
    paymentTarget: 0,
    discount: 0.00,
    orderStatus: 0,
    orderLineRequests: [
      {
        itemName: 'Welcome Box - Techstarter',
        articleNumber: '1498',
        itemNetSale: 0.00,
        itemVAT: 0.00,
        quantity: 1,
        type: 0,
        discount: 0.00,
        netPurchasePrice: 0.00
      }
    ],
    shippingAddressRequests: [
      {
        salutation: 'Mr',
        firstName: 'Ryan',
        lastName: 'Wire',
        title: '',
        company: '',
        companyAddition: '',
        street: 'Kiu River',
        addressAddition: '',
        zipCode: '40227',
        place: 'Nairobi',
        phone: '',
        state: '',
        country: 'Kenya',
        iso: '',
        telephone: '',
        mobile: '',
        fax: '',
        email: 'ryan@biglittlethings.de'
      }
    ]
  },
  {
    costCenter: '',
    platform: 0,
    language: 0,
    currency: 'EUR',
    orderNo: '0',
    inetorderno: 0,
    shippingId: 21,
    shipped: '2023-07-28 10:35:11.0000000',
    deliverydate: '2023-07-31 10:35:11.0000000',
    note: '',
    description: ' +',
    paymentType: 0,
    paymentTarget: 0,
    discount: 0.00,
    orderStatus: 0,
    orderLineRequests: [
      {
        itemName: 'Welcome Box - Techstarter',
        articleNumber: '1498',
        itemNetSale: 0.00,
        itemVAT: 0.00,
        quantity: 1,
        type: 0,
        discount: 0.00,
        netPurchasePrice: 0.00
      }
    ],
    shippingAddressRequests: [
      {
        salutation: 'Mr',
        firstName: 'Hannes',
        lastName: 'Brelloch',
        title: '',
        company: '',
        companyAddition: '',
        street: 'Flügelstraße 6',
        addressAddition: '',
        zipCode: '40227',
        place: 'Düsseldorf',
        phone: '',
        state: '',
        country: 'Germany',
        iso: '',
        telephone: '',
        mobile: '',
        fax: '',
        email: 'hannes@biglittlethings.de'
      }
    ]
  },
  {
    costCenter: '',
    platform: 0,
    language: 0,
    currency: 'EUR',
    orderNo: '0',
    inetorderno: 0,
    shippingId: 21,
    shipped: '2023-07-28 10:35:11.0000000',
    deliverydate: '2023-07-31 10:35:11.0000000',
    note: '',
    description: ' +',
    paymentType: 0,
    paymentTarget: 0,
    discount: 0.00,
    orderStatus: 0,
    orderLineRequests: [
      {
        itemName: 'Welcome Box - Techstarter',
        articleNumber: '1498',
        itemNetSale: 0.00,
        itemVAT: 0.00,
        quantity: 1,
        type: 0,
        discount: 0.00,
        netPurchasePrice: 0.00
      }
    ],
    shippingAddressRequests: [
      {
        salutation: 'Mr',
        firstName: 'Paul',
        lastName: 'Muia',
        title: '',
        company: '',
        companyAddition: '',
        street: 'Manyanja Road',
        addressAddition: '',
        zipCode: '40227',
        place: 'Nairobi',
        phone: '',
        state: '',
        country: 'Kenya',
        iso: '',
        telephone: '',
        mobile: '',
        fax: '',
        email: 'paul@biglittlethings.de'
      }
    ]
  }
]

export const createEmailTemplateType = async (name = 'Reset Password Test', description = 'A template for password reset', type = 'resetPasswordTest', placeholders = ['firstname']): Promise<string> => {
  const res = await db.EmailTemplateType.create({
    id: uuidv4(),
    name,
    description,
    type,
    placeholders
  })

  return res.id
}

export const createBlockedDomain = async (domain: string): Promise<string> => {
  const res = await db.BlockedDomain.create({
    id: uuidv4(),
    domain
  })

  return res
}

export const deleteAllNonDefaultEmailTemplates = async (): Promise<void> => {
  await db.EmailTemplate.destroy({
    force: true,
    where: {
      isDefault: false
    }
  })
}

export const removeCompanyOwnerId = async (id: string): Promise<any> => {
  const company = await db.Company.findOne({
    where: {
      id
    }
  })

  if (company !== null) {
    await company.update({
      userId: null
    })
  }
}

export const createShipment = async (): Promise<any> => {
  const foundShipment = await db.Shipment.findOne({
    where: {
      id: '6b8ce000-d011-11ee-8842-2dce8a298382',
      trackingId: '12345678900'
    }
  })

  if (foundShipment !== null) {
    await foundShipment.destroy({ force: true })
  }
  const shipment = await db.Shipment.create({
    id: '6b8ce000-d011-11ee-8842-2dce8a298382',
    trackingId: '12345678900',
    statusCode: 'transit',
    data: '[{"id": "12345678900", "events": [{"location": {"address": {"addressLocality": "Tarnów"}}, "timestamp": "2022-04-15T14:44:17", "statusCode": "transit", "description": "przesyłka przyjęta w terminalu nadawczym DHL"}], "status": {"location": {"address": {"addressLocality": "Tarnów"}}, "timestamp": "2022-04-15T14:44:17", "statusCode": "transit", "description": "przesyłka przyjęta w terminalu nadawczym DHL"}, "details": {"proofOfDeliverySignedAvailable": false}, "service": "parcel-pl"}]',
    createdAt: '2024-02-20 19:59:33.248+03',
    updatedAt: '2024-02-20 19:59:33.248+03',
    deletedAt: null
  })
  return shipment
}

export const createMaintenanceMode = async (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs, reason = 'A new module is being set up', isActive = true): Promise<any> => {
  await db.MaintenanceMode.create({
    id: uuidv4(),
    isActive,
    reason,
    startDate,
    endDate
  })
}

export const deleteAllMaintenanceModes = async (): Promise<void> => {
  await db.MaintenanceMode.truncate()
}

export const setSubscriptionToPaid = async (subscriptionId: string): Promise<void> => {
  const subscription = await db.CompanySubscription.findOne({
    where: {
      id: subscriptionId
    }
  })
  if (subscription !== null) {
    await subscription.update({ paymentStatus: 'paid' })
  }
}

export const updateCampaignUsedQuota = async (campaignId: string, usedQuota: number): Promise<any> => {
  const campaign = await db.Campaign.findOne({
    where: {
      id: campaignId
    }
  })

  if (campaign !== null) {
    await campaign.update({
      usedQuota
    })
  }
}

export const createJTLShippingMethod = async (): Promise<any> => {
  const jtlShippingMethod = await db.JtlShippingMethod.create({
    id: uuidv4(),
    shippingMethodId: 'NDZ20AG4HTCWN6XW',
    name: 'Big Little Things Einzelversand',
    fulfillerId: 'NDZ2',
    shippingType: 'Standard',
    trackingUrlSchema: null,
    carrierCode: 'DHL',
    carrierName: null,
    cutoffTime: null,
    note: null,
    modificationInfo: {
      createdAt: '2022-04-21T06:44:40.236+00:00',
      updatedAt: '2022-04-21T06:44:40.236+00:00',
      state: 'New'
    },
    createdAt: '2024-04-12T20:52:17.000Z',
    updatedAt: '2024-04-12T20:52:17.000Z'
  })
  return jtlShippingMethod
}
