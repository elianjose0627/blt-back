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
  email: string
  phone?: string
  vat?: string
  createdAt?: Date
  updatedAt?: Date
  owner?: IUser
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
  email: string
  role: string
  logoutTime: any
  isVerified: boolean
}

export interface CustomResponse extends Response {}

export interface CustomNext extends NextFunction {}
