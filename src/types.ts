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
  title?: string
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
  hireDate: Nullable<Date>
  startDate: Nullable<Date>
  birthDate: Nullable<Date>
  releaseDate: Nullable<Date>
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
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface ITitle {
  id: string
  name: string
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

export type Permission = typeof permissions.READ | typeof permissions.READWRITE | typeof permissions.NOACCESS

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
  isPackaging: boolean
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
  stock: IStock
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
  theme: Nullable<Theme>
  logo: Nullable<MediaData>
  subscriptions: ICompanySubscription[]
  productAccessControlGroups: IProductAccessControlGroup[]
  companyUserGroups: ICompanyUserGroup[]
  shopHeader: Nullable<IShopHeader>
  isDocumentGenerationEnabled: boolean
  defaultProductCategoriesHidden: boolean
}

export type AddressType = 'billing' | 'delivery' | 'billingAndDelivery' | 'return'
export type AddressAffiliation = 'personal' | 'company' | 'other' | null

export interface ICompanyInviteToken {
  id: string
  inviteToken: string
  role: Role
  isDomainCheckEnabled: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface IAddress {
  id: string
  companyName?: string
  salutation?: Nullable<string>
  title?: Nullable<string>
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
  title: Nullable<string>
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
  hireDate: Nullable<Date>
  startDate: Nullable<Date>
  birthDate: Nullable<Date>
  releaseDate: Nullable<Date>
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

export interface ICampaignQuota {
  id: string
  orderedQuota: number
  orderedDate: Date
  orderId: string
  createdBy: string
  updatedBy: string
  createdAt: Date
  updatedAt: Date
}

export type TimeFrequencyUnit = 'hour' | 'hours' | 'day' | 'days' | 'week' | 'weeks' | 'month' | 'months'
export interface ICampaignQuotaNotification {
  id: string
  threshold: number
  recipients: string[]
  frequency: number
  frequencyUnit: TimeFrequencyUnit
  lastSentAt: Nullable<Date>
  isEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

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
  isBulkCreateEnabled: boolean
  includeStartDate: boolean
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
  totalOrderedQuota: number
  campaignAdditionalProductSettings: ICampaignAdditionalProductSetting[]
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
  sortIndex: number
  isHidden: boolean
  createdAt: Date
  updatedAt: Date
  productCategoryTags?: IProductCategoryTag[]
  company?: Pick<ICompany, 'id' | 'name'>
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
  type: string
  sortIndex: number
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
  minimumOrderQuantity: number
  articleId: number
  specifications: Nullable<ISpecifications>
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

export interface IInvoice {
  id: string
  postedOrderId: string
  invoiceNumber: number
  taxRate: number
  discountRate: number
  totalVat: number
  totalNet: number
  totalGross: number
  totalDiscount: number
  totalShipping: number
  amountPaid: number
  currency: string
  status: string
  isEmailSent: boolean
  orderLineRequests: OrderLineRequest[]
  shippingAddressRequests: ShippingAddressRequest[]
  billingAddressRequests: BillingAddressRequest[]
  company: ICompany
  campaign: ICampaign
  owner: IUser
  dueDate: Date
  deliveryDate: Date
  documentDate: Date
  costCenter: string | null
  createdAt: Date
  updatedAt: Date
  externalOrderNumber: string
  externalProjectNumber: string
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
  isVisible: boolean
}

export interface ICountry {
  id: string
  name: string
  nameGerman: string
  alpha2Code: string
  alpha3Code: string
  numeric: number
  shippingBaseFee: number
  shippingPerBundle: number
  createdAt: Date
  updatedAt: Date
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
  apiKeyPermissions?: ApiKeyPermission[]
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
  costCenter?: string
  startDate?: Nullable<Date>
  createdBy: string
  updatedBy: string
}

export interface BillingAddressRequest extends ShippingAddressRequest {}

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
  userId?: string
  campaignId?: string
  companyId?: string
  platform: number
  language: number
  currency: string
  orderNo: string
  inetorderno: number
  shippingId: number
  shipped: Date
  deliveryDate: Date
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
  billingAddressRequests: BillingAddressRequest[]
  paymentInformationRequests: PaymentInformationRequest[]
  isPosted: boolean
  postedOrderId: Nullable<string>
  isGreetingCardSent: boolean
  created: Date
  createdAt?: Date
  updatedAt?: Date
  company?: Pick<ICompany, 'id' | 'customerId' | 'name'>
  isOrderConfirmationGenerated: boolean
  isInvoiceGenerated: boolean
  isQueued: boolean
  jtlId: number
  jtlNumber: string
  owner: Pick<IUser, 'id' | 'firstName' | 'lastName' | 'email'>
  isPackingSlipGenerated: boolean
  campaign: Pick<ICampaign, 'id' | 'name'>
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

export interface RequestBodyPendingOrders {
  pendingOrders: IPendingOrder[]
}

export interface ApiKeyPermission {
  module: Module
  permission: Permission
  isEnabled: boolean
}
export interface IApiKey {
  id: string
  isEnabled: boolean
  description: Nullable<string>
  validFrom: Date
  validTo: Nullable<Date>
  revokedAt: Nullable<Date>
  permissions: ApiKeyPermission[]
  createdAt: Date
  updatedAt: Date
}

export interface IShopHeader {
  url: string
  filename: string
}

export interface IPhoto {
  url: string
  filename: string
}

export type ProductCustomisationType = 'print' | 'engraving'
export interface IProductCustomisation {
  id: string
  customisationType: ProductCustomisationType
  customisationDetail: object
  price: number
  available: boolean
  photo: IPhoto[]
  owner: IUser
  createdAt: Date
  updatedAt: Date
  product?: IProduct
}

export interface IPackingSlip {
  id: string
  postedOrderId: string
  packingSlipNumber: number
  trackingId: Nullable<string>
  costCenter: string | null
  externalOrderNumber: string
  externalProjectNumber: string
  dueDate: Date
  deliveryDate: Date
  documentDate: Date
  isEmailSent: boolean
  orderLineRequests: OrderLineRequest[]
  shippingAddressRequests: ShippingAddressRequest[]
  billingAddressRequests: BillingAddressRequest[]
  company: ICompany
  campaign: ICampaign
  owner: IUser
  createdAt: Date
  updatedAt: Date
}

export interface IOrderConfirmation {
  id: string
  postedOrderId: string
  orderConfirmationNumber: number
  costCenter: string | null
  externalOrderNumber: string
  externalProjectNumber: string
  taxRate: number
  discountRate: number
  totalVat: number
  totalNet: number
  totalGross: number
  totalDiscount: number
  totalShipping: number
  amountPaid: number
  currency: string
  isEmailSent: boolean
  dueDate: Date
  deliveryDate: Date
  documentDate: Date
  orderLineRequests: OrderLineRequest[]
  shippingAddressRequests: ShippingAddressRequest[]
  billingAddressRequests: BillingAddressRequest[]
  company: ICompany
  campaign: ICampaign
  owner: IUser
  createdAt: Date
  updatedAt: Date
}

export interface ICampaignAdditionalProductSetting {
  id: string
  role: Role
  isSelectEnabled: boolean
  createdAt?: Date
  updatedAt?: Date
  campaign?: Pick<ICampaign, 'id' | 'name'>
}

export interface ISupplierProduct {
  id: string
  masterCode: string
  masterId: string
  typeOfProducts: string
  commodityCode: string
  numberOfPrintPositions: string
  countryOfOrigin: string
  brand: string
  productName: string
  categoryCode: string
  productClass: string
  dimensions: string
  length: number
  lengthUnit: string
  width: number
  widthUnit: string
  height: number
  heightUnit: string
  volume: number
  volumeUnit: string
  grossWeight: number
  grossWeightUnit: string
  netWeight: number
  netWeightUnit: string
  innerCartonQuantity: number
  outerCartonQuantity: number
  cartonLength: number
  cartonLengthUnit: string
  cartonWidth: number
  cartonWidthUnit: string
  cartonHeight: number
  cartonHeightUnit: string
  cartonVolume: number
  cartonVolumeUnit: string
  cartonGrossWeight: number
  cartonGrossWeightUnit: string
  timestamp: Date
  shortDescription: string
  longDescription: string
  material: string
  printable: string
  createdAt: Date
  updatedAt: Date
}
export interface ISupplierProductDigitalAsset {
  id: string
  supplierProductId: string
  supplierProductVariantId: string
  url: string
  urlHighress: string
  type: string
  subtype: string
  for: string
  createdAt: Date
  updatedAt: Date
}

export interface ISupplierProductVariant {
  id: string
  supplierProductId: string
  variantId: string
  sku: string
  releaseDate: Date
  discontinuedDate: Date
  productPropositionCategory: string
  categoryLevel1: string
  categoryLevel2: string
  categoryLevel3: string
  colorDescription: string
  colorGroup: string
  plcStatus: string
  plcStatusDescription: string
  gtin: string
  colorCode: string
  pmsColor: string
  createdAt: Date
  updatedAt: Date
}

export interface ISupplierProductStock {
  id: string
  sku: string
  firstArrivalDate: Date
  quantity: number
  firstArrivalQuantity: number
  nextArrivalDate: Date
  nextArrivalQuantity: number
  createdAt: Date
  updatedAt: Date
}

export interface ISupplierProductPriceListScale {
  minimumQuantity: number
  price: number
}

export interface ISupplierProductPriceList {
  id: string
  sku: string
  variantId: string
  price: number
  currency: string
  validUntil: Date
  scale: ISupplierProductPriceListScale[]
  createdAt: Date
  updatedAt: Date
}

export interface ISupplierProductPrintDataProduct {
  id: string
  masterCode: string
  masterId: string
  itemColorNumbers: string[]
  printManipulation: string
  printTemplate: string
  createdAt: Date
  updatedAt: Date
}

export interface ISupplierProductPrintDataPrintingTechnique {
  default: boolean
  id: string
  maxColours: string
}

export interface ISupplierProductPrintDataPoint {
  distanceFromLeft: number
  distanceFromTop: number
  sequenceNo: number
}
export interface ISupplierProductPrintDataImage {
  printPositionImageBlank: string
  printPositionImageWithArea: string
  variantColor: string
}
export interface ISupplierProductPrintDataProductPrintingPosition {
  id: string
  positionId: string
  printSizeUnit: string
  maxPrintSizeHeight: number
  maxPrintSizeWidth: number
  rotation: number
  printPositionType: string
  printingTechniques: ISupplierProductPrintDataPrintingTechnique[]
  points: ISupplierProductPrintDataPoint[]
  images: ISupplierProductPrintDataImage[]
  supplierProductPrintDataProductId: string
  createdAt: Date
  updatedAt: Date
}
export interface ISupplierProductPrintingTechniqueDescription {
  id: string
  printingTechniqueDescriptionId: string
  name: object
  createdAt: Date
  updatedAt: Date
}
