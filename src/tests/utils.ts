import { v1 as uuidv1 } from 'uuid'
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
    email: 'drstrange@gmail.com',
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
    email: 'hh@gmail.com',
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

export const createCampaignManager = async (email = 'happyhogan@starkindustries.com', password = 'pepperpotts'): Promise<any> => {
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

export const createUnverifiedAdmin = async (): Promise<any> => {
  const user = await db.User.create({
    id: uuidv1(),
    firstName: 'Trish',
    lastName: 'Walker',
    email: 'trishwalker@alias.com',
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
    email: 'monicarambeau@sword.com',
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
    email: 'mariarambeau@sword.com',
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
    email: 'thenaeternal@celestial.com',
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
    email: 'sersieternal@celestial.com',
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
