export const MODULES = {
  ACCESSPERMISSIONS: 'accessPermissions',
  ADDRESSES: 'addresses',
  BUNDLES: 'bundles',
  CAMPAIGNS: 'campaigns',
  COMPANIES: 'companies',
  COSTCENTERS: 'costCenters',
  LEGALTEXTS: 'legalTexts',
  ORDERS: 'orders',
  PICTURES: 'pictures',
  PRIVACYRULES: 'privacyRules',
  PRODUCTS: 'products',
  RECIPIENTS: 'recipients',
  SALUTATIONS: 'salutations',
  SECONDARYDOMAINS: 'secondaryDomains',
  SHIPMENTS: 'shipments',
  USERS: 'users',
  COMPANYSUBSCRIPTIONS: 'companySubscriptions',
  PRODUCTCATEGORIES: 'productCategories',
  PRODUCTCUSTOMISATIONS: 'productCustomisations',
  PRODUCTSTOCKNOTIFICATIONS: 'productStockNotifications',
  CAMPAIGNADDITIONALPRODUCTSETTINGS: 'campaignAdditionalProductSettings'
} as const

export const {
  ACCESSPERMISSIONS,
  ADDRESSES,
  BUNDLES,
  CAMPAIGNS,
  COMPANIES,
  COSTCENTERS,
  LEGALTEXTS,
  ORDERS,
  PICTURES,
  PRIVACYRULES,
  PRODUCTS,
  RECIPIENTS,
  SALUTATIONS,
  SECONDARYDOMAINS,
  SHIPMENTS,
  USERS,
  COMPANYSUBSCRIPTIONS,
  PRODUCTCATEGORIES,
  PRODUCTCUSTOMISATIONS,
  PRODUCTSTOCKNOTIFICATIONS,
  CAMPAIGNADDITIONALPRODUCTSETTINGS
} = MODULES

export const MODULES_ARRAY = Object.values(MODULES)
