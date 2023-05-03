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

export interface IShippingMethod {
  id: string
  name: string
  shippingType: number
  insuranceValue: number
  isDropShipping: boolean
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
  description: string
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
  isLocked: boolean
  isBillOfMaterials: boolean
  shippingMethodType: number
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
  secondaryDomains?: ISecondaryDomain[]
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
  description: string
  createdAt?: Date
  updatedAt?: Date
  company?: ICompany
}

export interface ISecondaryDomain {
  id: string
  name: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export type ProductType = 'generic' | 'custom'
export interface NetRetailPrice {
  amount: number
  currency: string
  discount: number
}

export interface IProductPicture {
  number: number
  url: string
  publicUrl: string
  size: number
  mimeType: string
}

export interface IProduct {
  id: string
  jfsku: string
  name: string
  merchantSku: string
  productGroup: string
  type: ProductType
  netRetailPrice: NetRetailPrice
  pictures: IProductPicture[]
  createdAt?: Date
  updatedAt?: Date
  company?: ICompany
}

export interface ShippingAddress {
  lastname: string
  city: string
  email: string
  firstname: string
  street: string
  zip: string
  country: string
  extraAddressLine?: string
}

export interface Item {
  jfsku: string
  outboundItemId: string
  name: string
  merchantSku: string
  quantity: number
  itemType: string
  quantityOpen: number
  externalNumber: string
  price: number
  vat: number
  billOfMaterialsId?: string
}

export interface SenderAddress {
  company: string
  city: string
  email: string
  street: string
  zip: string
  country: string
  phone: string
}

export interface Attribute {
  key: string
  value: string
  attributeType: string
}

export interface StatusTimestamp {
  pending: string
  preparation: string
  acknowledged: string
}

export interface ModificationInfo {
  createdAt: string
  updatedAt: string
  state: string
}

export interface Outbound {
  outboundId: string
  fulfillerId: string
  merchantOutboundNumber: string
  warehouseId: string
  status: string
  shippingAddress: ShippingAddress
  items: Item[]
  senderAddress: SenderAddress
  attributes: Attribute[]
  statusTimestamp: StatusTimestamp
  priority: number
  currency: string
  externalNote: string
  salesChannel: string
  desiredDeliveryDate: string
  shippingMethodId: string
  shippingType: string
  shippingFee: number
  orderValue: number
  attachments: any[]
  modificationInfo: ModificationInfo
}

export interface IOrder {
  id: string
  outboundId: string
  fulfillerId: string
  merchantOutboundNumber: string
  warehouseId: string
  status: string
  shippingAddress: ShippingAddress
  items: Item[]
  senderAddress: SenderAddress
  attributes: Attribute[]
  priority: number
  currency: string
  externalNote: string
  salesChannel: string
  desiredDeliveryDate: string
  shippingMethodId: string
  shippingType: string
  shippingFee: number
  orderValue: number
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
  mail_settings?: {
    sandbox_mode: {
      enable: boolean
    }
  }
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
