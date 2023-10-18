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
  'users'
]

export const allowedCompanyModules: Array<{ name: string, value: Module }> = [
  { name: 'Access Permissions', value: ACCESSPERMISSIONS },
  { name: 'Companies', value: COMPANIES },
  { name: 'Campaigns', value: CAMPAIGNS },
  { name: 'Recipients', value: RECIPIENTS },
  { name: 'Bundles', value: BUNDLES },
  { name: 'Cost Centers', value: COSTCENTERS },
  { name: 'Inventory Products', value: PRODUCTS },
  { name: 'Addresses', value: ADDRESSES },
  { name: 'Orders', value: ORDERS }
]
