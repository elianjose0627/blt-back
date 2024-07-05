import type { Request, Response, NextFunction } from 'express'
import type * as userRoles from './utils/userRoles'
import type * as appModules from './utils/appModules'
import type * as permissions from './utils/permissions'

export type Nullable<T> = T | null

export type TokenType = 'login' | 'reset'

export interface MediaData {
  filename: Nullable<string>
  url: Nullable<string>
}

export type Role = typeof userRoles.USER | typeof userRoles.ADMIN | typeof userRoles.EMPLOYEE | typeof userRoles.COMPANYADMINISTRATOR | typeof userRoles.CAMPAIGNMANAGER

export interface StatusCode {
  [key: string]: number
}

export type Environment = 'development' | 'test' | 'staging' | 'production'

export type FilterOperator = 'equals' | 'in'

export interface DbConfig {
  use_env_variable: string
  dialect: string
  logging?: boolean
  dialectOptions?: {
    ssl: {
      require: boolean
      rejectUnauthorized: boolean
    }
  }
}

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
  company: Partial<ICompany> | null
  addresses: Array<Partial<IAddress>>
  productAccessControlGroups: IProductAccessControlGroup[]
  companyUserGroups: ICompanyUserGroup[]
}

export interface IUserExtended extends IUser {
  companyId: string
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

export interface IAccessPermission {
  id: string
  name: string
  role: Role
  module: Module
  permission: Permission
  isEnabled: boolean
  createdAt: Date
  updatedAt: Date
  company?: ICompany
}

export type Module = typeof appModules.ACCESSPERMISSIONS | typeof appModules.ADDRESSES | typeof appModules.BUNDLES |
typeof appModules.CAMPAIGNS | typeof appModules.COMPANIES |
typeof appModules.COSTCENTERS | typeof appModules.LEGALTEXTS |
typeof appModules.ORDERS | typeof appModules.PICTURES |
typeof appModules.PICTURES | typeof appModules.PRIVACYRULES |
typeof appModules.PRODUCTS | typeof appModules.RECIPIENTS |
typeof appModules.SALUTATIONS | typeof appModules.SECONDARYDOMAINS |
typeof appModules.SHIPMENTS | typeof appModules.USERS |
typeof appModules.COMPANYSUBSCRIPTIONS

export type Permission = typeof permissions.READ | typeof permissions.READWRITE

export interface AllowedCompanyModule { name: string, module: Module, permission: Permission }
export interface IPrivacyRule {
  id: string
  module: Module
  role: Role
  isEnabled: boolean
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
  center: string
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

export interface ISpecifications {
  isBatch: boolean
  isDivisible: boolean
  isBestBefore: boolean
  isSerialNumber: boolean
  isBillOfMaterials: boolean
  billOfMaterialsComponents: BillOfMaterialsComponent[]
}

export interface BillOfMaterialsComponent {
  jfsku: string
  quantity: number
  merchantSku: string
  name: string
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
  specifications: ISpecifications
  pictures: IPicture[]
}

export interface Theme {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  foregroundColor: string
  accentColor: string
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
  addresses?: IAddress[]
  secondaryDomains?: ISecondaryDomain[]
  accessPermissions?: IAccessPermission[]
  inviteToken?: Nullable<string>
  theme: Nullable<Theme>
  logo: Nullable<MediaData>
  subscriptions: ICompanySubscription[]
  productAccessControlGroups: IProductAccessControlGroup[]
  companyUserGroups: ICompanyUserGroup[]
}

export type AddressType = 'billing' | 'delivery' | 'billingAndDelivery' | 'return'
export type AddressAffiliation = 'personal' | 'company' | 'other' | null

export interface IAddress {
  id: string
  companyName?: string
  salutation?: Nullable<string>
  firstName?: Nullable<string>
  lastName?: Nullable<string>
  email?: string
  costCenter?: string
  country: string
  city: string
  street?: string
  zip?: string
  phone?: string
  addressAddition?: string
  vat?: string
  createdAt?: Date
  updatedAt?: Date
  type: AddressType
  affiliation?: AddressAffiliation
  owner?: IUser
  company?: ICompany
  campaign?: ICampaign
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
  costCenter?: string
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
export type CampaignType = 'onboarding' | 'birthday' | 'christmas' | 'marketing'

export interface ICampaign {
  id: string
  name: string
  status: CampaignStatus
  type: CampaignType
  description: string
  quota: number
  usedQuota: number
  correctionQuota: number
  lastQuotaResetDate: Nullable<Date>
  isQuotaEnabled: boolean
  isExceedQuotaEnabled: boolean
  isExceedStockEnabled: boolean
  isNoteEnabled: boolean
  isActive: boolean
  isHidden: boolean
  createdAt?: Date
  updatedAt?: Date
  company?: ICompany
  cardTemplates?: ICardTemplate[]
  cardSetting?: ICardSetting
  campaignShippingDestinations: ICampaignShippingDestination[]
  campaignOrderLimits: ICampaignOrderLimit[]
  campaignAddresses: IAddress[]
  shippingMethodType: Nullable<number>
  shippingMethodIsDropShipping: boolean
}

export interface ISecondaryDomain {
  id: string
  name: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ILegalText {
  id: string
  type: 'privacy' | 'terms' | 'defaultPrivacy' | 'defaultTerms'
  template: object
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

export interface IStock {
  id: string
  jfsku: string
  merchantSku: Nullable<string>
  stockLevel: number
  stockLevelAnnounced: number
  stockLevelReserved: number
  stockLevelBlocked: number
  fulfillerTimestamp: Date
  createdAt: Date
  updatedAt: Date
}

export interface IProductCategoryTag {
  id: string
  name: string
  type: string
  createdAt: Date
  updatedAt: Date
  productCategory: {
    id: string
    name: string
  }
}

export interface IProductTag {
  id: string
  productCategoryTag: IProductCategoryTag
  createdAt: Date
  updatedAt: Date
}

export interface IProductCategory {
  id: string
  name: string
  description: Nullable<string>
  picture: Nullable<MediaData>
  createdAt: Date
  updatedAt: Date
  productCategoryTags?: IProductCategoryTag[]
}

export interface IProductGraduatedPrice {
  id: string
  firstUnit: number
  lastUnit: number
  price: number
  createdAt: Date
  updatedAt: Date
}
export interface IProductColor {
  id: string
  name: string
  hexCode: string
  rgb: string
  createdAt: Date
  updatedAt: Date
}
export interface IProductMaterial {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}
export interface IProductSize {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}
export interface IProductAccessControlGroup {
  id: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
  company: ICompany | null
  productCategoryTags: Array<Pick<IProductCategoryTag, 'id' | 'name'>>
  users: Array<Pick<IUser, 'id' | 'firstName' | 'lastName' | 'email'>>
  companies: Array<Pick<ICompany, 'id' | 'name'>>
  companyUserGroups: Array<Pick<ICompanyUserGroup, 'id' | 'name'>>
}
export interface ICompanyUserGroup {
  id: string
  name: string
  description: string
  company: ICompany
  users?: IUser[]
  accessControlGroups: IProductAccessControlGroup[]
  createdAt: Date
  updatedAt: Date
}
export interface IUserCompanyUserGroup {
  id: string
  userCompanyUserGroupId?: string
  userId?: string
  createdAt: Date
  updatedAt: Date
  user: Pick<IUser, 'id' | 'firstName' | 'lastName' | 'email'>
}
export interface ICompanyUserGroupInProductAccessControlGroup {
  id: string
  productAccessControlGroupId?: string
  companyUserGroupId?: string
  createdAt: Date
  updatedAt: Date
  companyUserGroup: Pick<ICompanyUserGroup, 'id' | 'name' & { company: { id: string, name: string, domain: string }}>
}
export interface IUserInProductAccessControlGroup {
  id: string
  productAccessControlGroupId?: string
  userId?: string
  createdAt: Date
  updatedAt: Date
  user: Pick<IUser, 'id' | 'firstName' | 'lastName' | 'email'>
}
export interface ICompanyProductAccessControlGroup {
  id: string
  productAccessControlGroupId?: string
  companyId?: string
  createdAt: Date
  updatedAt: Date
  company: Pick<ICompany, 'id' | 'name' | 'domain' | 'email'>
}
export interface IProductCategoryTagInProductAccessControlGroup {
  id: string
  productAccessControlGroupId?: string
  productCategoryTagId?: string
  createdAt: Date
  updatedAt: Date
  productCategoryTag: Pick<IProductCategoryTag, 'id' | 'name' | 'type'> & { productCategory: { id: string, name: string }}
}
export interface IProductProductCategory {
  id: string
  productCategoryId?: string
  productId?: string
  createdAt: Date
  updatedAt: Date
  product: Pick<IProduct, 'id' | 'name'>
}
export interface IMassUnit {
  id: string
  publicId: string
  name: string
  code: string
  displayCode: string
  referenceMassUnit: number
  referenceMassUnitFactor: number
  createdAt: Date
  updatedAt: Date
}
export interface ISalesUnit {
  id: string
  publicId: string
  name: string
  unit: number
  createdAt: Date
  updatedAt: Date
}
export interface ITaxRate {
  id: string
  publicId: string
  name: string
  zone: string
  countryCode: string
  rate: number
  createdAt: Date
  updatedAt: Date
}
export interface IProductDetail {
  id: string
  metadata: object
  createdAt: Date
  updatedAt: Date
}
export interface IProduct {
  id: string
  jfsku: Nullable<string>
  name: string
  description: string
  merchantSku: string
  productGroup: string
  type: ProductType
  netRetailPrice: NetRetailPrice
  pictures: IProductPicture[]
  createdAt: Date
  updatedAt: Date
  company?: ICompany
  stock?: IStock
  isVisible?: boolean
  productCategories?: IProductCategory[]
  productTags?: IProductTag[]
  isParent: boolean
  children: Array<Pick<IProduct, 'id' | 'jfsku' | 'name' | 'merchantSku' | 'pictures' | 'createdAt' | 'updatedAt' | 'productColor' | 'productMaterial' | 'productSize'>>
  graduatedPrices: IProductGraduatedPrice[]
  productColor: IProductColor
  productMaterial: IProductMaterial
  productSize: IProductSize
  recommendedNetSalePrice: number
  shippingWeight: number
  weight: number
  barcode: Nullable<string>
  upc: Nullable<string>
  taric: Nullable<string>
  originCountry: Nullable<string>
  bestBeforeDate: boolean
  serialNumberTracking: boolean
  width: number
  height: number
  length: number
  massUnit: IMassUnit
  salesUnit: ISalesUnit
  taxRate: ITaxRate
  metadata: IProductDetail
  isMetadataSynced: boolean
  isExceedStockEnabled: boolean
}

export interface ICampaignOrderLimit {
  id: string
  limit: number
  role: Role
  createdAt: Date
  updatedAt: Date
}

export interface ICampaignShippingDestination {
  id: string
  country: string
  createdAt: Date
  updatedAt: Date
}

export interface IEmailTemplateType {
  id: string
  name: string
  type: string
  description: string
  placeholders: string[]
  createdAt: Date
  updatedAt: Date
}

export interface IEmailTemplate {
  id: string
  subject: string
  template: string
  emailTemplateType: IEmailTemplateType
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IBlockedDomain {
  id: string
  domain: string
  createdAt: Date
  updatedAt: Date
}

export interface IMaintenanceMode {
  id: string
  reason: string
  isActive: boolean
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface IJtlShippingMethod {
  id: string
  shippingMethodId: string
  name: string
  fulfillerId: string
  shippingType: string
  trackingUrlSchema: string
  carrierName: string
  carrierCode: string
  cutoffTime: string
  note: string
  modificationInfo: ModificationInfo
  createdAt: Date
  updatedAt: Date
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
  changesInRange?: object[]
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
  internalNote: string
  salesChannel: string
  desiredDeliveryDate: string
  shippingMethodId: string
  shippingType: string
  shippingFee: number
  orderValue: number
  createdByFullName: Nullable<string>
  shipped: Nullable<Date>
  deliveryDate: Nullable<Date>
  createdAtByUser: Nullable<Date>
  modificationInfo: Nullable<ModificationInfo>
  createdAt?: Date
  updatedAt?: Date
  company?: ICompany
  shipments?: IShipment[]
  trackingId: Nullable<string>
}

export interface CustomRequest extends Request {
  user?: any
  employee?: any
  record?: any
  query: any
  company?: any
  joiError?: boolean
  module?: Module
  isOwnerOrAdmin?: boolean
  isOwner?: boolean
  accessPermissions?: IAccessPermission[]
  accessProductCategoryTags?: string[]
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

export interface SlackEvent {
  email: string
  timestamp: number
  'smtp-id': string
  event: string
  category: string[]
  sg_event_id: string
  sg_message_id: string
  useragent: string
  ip: string
  url: string
  asm_group_id: number
  reason: string
}

export interface PaymentInformationRequest {
  orderId: number
  bankName: string
  blz: string
  accountno: string
  cardno: string
  validity: Date
  cvv: string
  cardType: string
  owner: string
  iban: string
  bic: string
  createdBy: string
  updatedBy: string
}

export interface ShippingAddressRequest {
  orderId: number
  salutation: string
  firstName: string
  lastName: string
  title: string
  company: string
  companyAddition: string
  street: string
  addressAddition: string
  zipCode: string
  place: string
  phone: string
  state: string
  country: string
  iso: string
  telephone: string
  mobile: string
  fax: string
  email: string
  createdBy: string
  updatedBy: string
}

export interface OrderLineRequest {
  orderId: number
  itemName: string
  articleNumber: string
  itemNetSale: number
  itemVAT: number
  quantity: number
  type: number
  discount: number
  netPurchasePrice: number
  createdBy: string
  updatedBy: string
}

export interface IPendingOrder {
  id: string
  customerId: string
  userId: string
  campaignId: string
  companyId: string
  platform: number
  language: number
  currency: string
  orderNo: string
  inetorderno: number
  shippingId: number
  shipped: Date
  deliverydate: Date
  note: string
  description: string
  costCenter: string
  paymentType: number
  paymentTarget: number
  discount: number
  orderStatus: number
  quantity: number
  createdBy: string
  updatedBy: string
  createdByFullName: string
  orderLineRequests: OrderLineRequest[]
  shippingAddressRequests: ShippingAddressRequest[]
  paymentInformationRequests: PaymentInformationRequest[]
  isPosted: boolean
  postedOrderId: Nullable<string>
  isGreetingCardSent: boolean
  created: Date
  createdAt?: Date
  updatedAt?: Date
  company?: ICompany
}

export interface IDuplicatePostedOrder {
  orderId: string
  shipped: Date
}

export interface ICardTemplate {
  id: string
  name: string
  description: string
  isDraft: boolean
  front: string
  back: string
  frontOrientation: string
  backOrientation: string
  articleId: string | null
  isBarcodeEnabled: boolean
  eanBarcode: string | null
  upcBarcode: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ICardSetting {
  id: string
  isEnabled: boolean
  isFrontSelectable: boolean
  isRotationEnabled: boolean
  isBackEditable: boolean
  isAutoProcessingEnabled: boolean
  defaultBack: string
  defaultFront: string
  exportOrientation: 'portrait' | 'landscape'
  exportSides: 'both' | 'front' | 'back'
  supplierEmail: string
  articleId: string | null
  isBarcodeEnabled: boolean
  eanBarcode: string | null
  upcBarcode: string | null
  createdAt: Date
  updatedAt: Date
}

export interface IGreetingCard {
  id: string
  articleNumber: string
  articleName: string
  url: string
  totalStock: number
  inventory: number
  availableStock: number
  jtlfpid: string
  createdAt: Date
  updatedAt: Date
}

export type SubscriptionPlan = 'premium' | 'basic' | 'custom' | 'trial'
export type SubscriptionPaymentStatus = 'paid' | 'pending'
export interface ICompanySubscription {
  id: string
  email: string
  plan: SubscriptionPlan
  startDate: Date
  endDate: Date
  paymentStatus: SubscriptionPaymentStatus
  price: number
  discount: number
  vat: number
  description: string
  autoRenew: boolean
  createdAt: Date
  updatedAt: Date
}
