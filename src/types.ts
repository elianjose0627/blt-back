import { Request, Response, NextFunction } from 'express'
import * as userRoles from './utils/userRoles'

export type Nullable<T> = T | null

export type TokenType = 'login' | 'reset'

export interface MediaData {
  filename: Nullable<string>
  url: Nullable<string>
}

export type Role = typeof userRoles.USER | typeof userRoles.ADMIN | typeof userRoles.EMPLOYEE | typeof userRoles.COMPANYADMINISTRATOR | typeof userRoles.CAMPAIGNMANAGER

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
  isGhost?: boolean
  createdAt: Date
  updatedAt: Date
  notifications: INotifications
  loginTime: LoginTime
  logoutTime?: Nullable<Date>
  company: ICompany | null
  address: IAddress | null
}

export interface IToken {
  id: string
  accessToken: string
  refreshToken: string
  createdAt: Date
  updatedAt: Date
}

export interface IShipment {
  id: string
  trackingId: string
  statusCode: string
  data: object
  createdAt: Date
  updatedAt: Date
}

export interface ISalutation {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
}

export interface ICostCenter {
  id: string
  center: number
  createdAt: Date
  updatedAt: Date
}
export interface IBundleItem {
  id: string
  jfsku: string
  merchantSku: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface IBundle {
  id: string
  jfsku: string
  merchantSku: string
  name: string
  description: string
  price: number
  createdAt: Date
  updatedAt: Date
  campaign: ICampaign
  items: IBundleItem[]
  pictures: IPicture[]
}

export interface ICompany {
  id: string
  customerId: number
  name: string
  suffix: string
  email: string
  phone?: string
  vat?: string
  domain?: Nullable<string>
  isDomainVerified: boolean
  domainVerificationCode: { value: string, createdAt: Date }
  createdAt?: Date
  updatedAt?: Date
  owner?: IUser
  address?: IAddress
}

export interface IAddress {
  id: string
  country: string
  city: string
  street?: string
  zip?: string
  phone?: string
  addressAddition?: string
  vat?: string
  createdAt?: Date
  updatedAt?: Date
  owner?: IUser
  company?: ICompany
}

export interface IRecipient {
  id: string
  companyName: Nullable<string>
  salutation: Nullable<string>
  firstName: Nullable<string>
  lastName: Nullable<string>
  email: string
  phone?: Nullable<string>
  country: string
  city: string
  street?: string
  zip?: string
  addressAddition?: string
  createdAt?: Date
  updatedAt?: Date
  company?: ICompany
}

export interface IPicture {
  id: string
  url: string
  filename: string
  size: number
  mimeType: Nullable<string>
  createdAt: Date
  updatedAt: Date
}

export type CampaignStatus = 'draft' | 'submitted'
export type CampaignType = 'onboarding' | 'birthday' | 'christmas'

export interface ICampaign {
  id: string
  name: string
  status: CampaignStatus
  type: CampaignType
  createdAt?: Date
  updatedAt?: Date
  company?: ICompany
}

export interface CustomRequest extends Request {
  user?: any
  employee?: any
  record?: any
  query: any
  company?: any
  joiError?: boolean
}

export interface TokenUser {
  id: string
  email: string
  role: string
  logoutTime: any
  isVerified: boolean
}

export interface EmailMessage {
  to: string
  from: string
  bcc: string
  subject: string
  text: string
  html?: string
}

export interface CustomResponse extends Response {}

export interface CustomNext extends NextFunction {}

export interface Address {
  countryCode: string
}

export interface Origin {
  address: Address
}

export interface Address2 {
  countryCode: string
}

export interface Destination {
  address: Address2
}

export interface Status {
  timestamp: Date
  statusCode: string
  status: string
  description: string
}

export interface Product {
  productName: string
}

export interface Weight {
  value: number
  unitText: string
}

export interface Width {
  value: number
  unitText: string
}

export interface Height {
  value: number
  unitText: string
}

export interface Length {
  value: number
  unitText: string
}

export interface Dimensions {
  width: Width
  height: Height
  length: Length
}

export interface Details {
  product: Product
  proofOfDeliverySignedAvailable: boolean
  totalNumberOfPieces: number
  pieceIds: string[]
  weight: Weight
  dimensions: Dimensions
}

export interface Event {
  timestamp: Date
  statusCode: string
  status?: string
  description: string
  location?: {
    address: {
      addressLocality: string
    }
  }
}

export interface Shipment {
  serviceUrl: string
  rerouteUrl: string
  id: string
  service: string
  origin: Origin
  destination: Destination
  status: Status
  details: Details
  events: Event[]
}

export interface TrackingData {
  shipments: Shipment[]
  possibleAdditionalShipmentsUrl: string[]
}
