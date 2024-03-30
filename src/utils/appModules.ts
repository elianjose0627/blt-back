import type { Module } from '../types'

export const ACCESSPERMISSIONS = 'accessPermissions'
export const ADDRESSES = 'addresses'
export const BUNDLES = 'bundles'
export const CAMPAIGNS = 'campaigns'
export const COMPANIES = 'companies'
export const COSTCENTERS = 'costCenters'
export const LEGALTEXTS = 'legalTexts'
export const ORDERS = 'orders'
export const PICTURES = 'pictures'
export const PRIVACYRULES = 'privacyRules'
export const PRODUCTS = 'products'
export const RECIPIENTS = 'recipients'
export const SALUTATIONS = 'salutations'
export const SECONDARYDOMAINS = 'secondaryDomains'
export const SHIPMENTS = 'shipments'
export const USERS = 'users'
export const COMPANYSUBSCRIPTIONS = 'companySubscriptions'

export const MODULES_ARRAY = [
  'accessPermissions',
  'addresses',
  'bundles',
  'campaigns',
  'companies',
  'costCenters',
  'legalTexts',
  'orders',
  'pictures',
  'privacyRules',
  'products',
  'recipients',
  'salutations',
  'secondaryDomains',
  'shipments',
  'users',
  'companySubscriptions'
]

export const allowedCompanyModules: Array<{ name: string, value: Module, readonly: boolean }> = [
  { name: 'Access Permissions', value: ACCESSPERMISSIONS, readonly: false },
  { name: 'Addresses', value: ADDRESSES, readonly: false },
  { name: 'Bundles', value: BUNDLES, readonly: true },
  { name: 'Campaigns', value: CAMPAIGNS, readonly: false },
  { name: 'Companies', value: COMPANIES, readonly: false },
  { name: 'Company Subscriptions', value: COMPANYSUBSCRIPTIONS, readonly: false },
  { name: 'Cost Centers', value: COSTCENTERS, readonly: false },
  { name: 'Inventory Products', value: PRODUCTS, readonly: true },
  { name: 'Orders', value: ORDERS, readonly: false },
  { name: 'Recipients', value: RECIPIENTS, readonly: false }
]
