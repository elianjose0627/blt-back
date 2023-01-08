import { v1 as uuidv1, v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import db from '../models'
import * as userRoles from '../utils/userRoles'

import utc from 'dayjs/plugin/utc'
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

export const createTestUser = async (): Promise<any> => {
  const user = await db.User.create({
    id: uuidv1(),
    firstName: 'Steven',
    lastName: 'Strange',
    email: 'drstrange@starkindustriesmarvel.com',
    phone: '2222222222',
    password: 'thesanctum',
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
  const user = await db.Company.findOne({
    where: {
      id
    }
  })

  if (user !== null) {
    await user.update({
      isDomainVerified: true
    })
  }
}
