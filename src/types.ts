import { Request, Response, NextFunction } from 'express'

export type Nullable<T> = T | null

export type TokenType = 'login'

export interface MediaData {
  filename: Nullable<string>
  url: Nullable<string>
}

export type Role = 'trainer' | 'administrator' | 'user'

export interface INotifications {
  expoPushToken: Nullable<string>
  isEnabled: boolean
}

export interface LoginTime {
  lastSuccessful: Date
  lastFailed: Nullable<Date>
  failed: number
}

export interface IUser {
  id: string
  salutation?: string
  location?: any
  firstName: string
  lastName: string
  username?: Nullable<string>
  email: string
  phone?: Nullable<string>
  photo: Nullable<MediaData>
  role: Role
  isActive: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  notifications: INotifications
  loginTime: LoginTime
  logoutTime?: Nullable<Date>
  company: ICompany | null
}

export interface ICustomer {
  id: string
  internalCustomerId: number
  createdAt: Date
  updatedAt: Date
  customer: IUser
}

export interface IToken {
  id: string
  accessToken: string
  refreshToken: string
  createdAt: Date
  updatedAt: Date
}

export interface ICompany {
  id: string
  name: string
  customerId: number
  email: string
  phone?: string
  vat?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CustomRequest extends Request {
  user?: any
  record?: any
  query: any
  team?: any
  workout?: any
  member?: any
  joiError?: boolean
}

export interface TokenUser {
  id: string
  company: ICompany | null
  email: string
  role: string
  logoutTime: any
}

export interface CustomResponse extends Response {}

export interface CustomNext extends NextFunction {}
