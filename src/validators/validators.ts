import { Joi } from 'celebrate'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import * as countryList from '../utils/countries'
import * as userRoles from '../utils/userRoles'
import * as currencies from '../utils/currencies'
import * as appModules from '../utils/appModules'
import * as permissions from '../utils/permissions'
import { productSelectedColumns } from '../utils/selectOptions'
import { phoneValidationPattern } from '../constants/regexPatterns'

dayjs.extend(utc)

const imageMimeTypes = ['image/bmp', 'image/jpeg', 'image/x-png', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const defaultTextLength = 10000

const validateCreatedUser = Joi.object({
  user: Joi.object({
    firstName: Joi.string().required().max(64),
    lastName: Joi.string().required().max(64),
    username: Joi.string().lowercase().optional().allow(null).max(64).regex(/^\S+$/)
      .messages({
        'string.pattern.base': '{#label} cannot contain spaces'
      }),
    email: Joi.string().email().lowercase().required().max(128),
    phone: Joi.string().optional().allow('').allow(null).regex(phoneValidationPattern)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    password: Joi.string().min(6).max(64).required()
  }).required()
}).required()

const validateCreatedUserByAdmin = Joi.object({
  user: Joi.object({
    firstName: Joi.string().required().max(64),
    lastName: Joi.string().required().max(64),
    username: Joi.string().lowercase().optional().allow(null).max(64).regex(/^\S+$/)
      .messages({
        'string.pattern.base': '{#label} cannot contain spaces'
      }),
    email: Joi.string().email().lowercase().required().max(128),
    phone: Joi.string().optional().allow('').allow(null).regex(phoneValidationPattern)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    password: Joi.string().min(6).max(64).required(),
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.ADMIN, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER])
      .required(),
    isActive: Joi.boolean().default(true),
    isGhost: Joi.boolean().default(false),
    companyId: Joi.string().uuid().allow(null).default(null),
    startDate: Joi.date().allow(null).default(null),
    birthDate: Joi.date().allow(null).default(null),
    hireDate: Joi.date().allow(null).default(null),
    releaseDate: Joi.date().allow(null).default(null)
  }).required()
}).required()

const validateLogin = Joi.object({
  user: Joi.object({
    email: Joi.string().lowercase().email().required(),
    password: Joi.string().required()
  }).required()
}).required()

const validateUpdatedUser = Joi.object({
  user: Joi.object({
    salutation: Joi.string().optional().allow('').allow(null).max(64),
    title: Joi.string().optional().allow('').allow(null).max(32),
    firstName: Joi.string().optional().max(64),
    lastName: Joi.string().optional().max(64),
    username: Joi.string().lowercase().optional().allow(null).max(64).regex(/^\S+$/)
      .messages({
        'string.pattern.base': '{#label} cannot contain spaces'
      }),
    phone: Joi.string().optional().allow('').allow(null).regex(phoneValidationPattern)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    location: Joi.object({
      country: Joi.string().required().valid(...countryList.countries).allow('').allow(null)
    }).optional().allow(null),
    birthDate: Joi.date().allow(null).default(null),
    hireDate: Joi.date().allow(null).default(null),
    releaseDate: Joi.date().allow(null).default(null),
    startDate: Joi.date().allow(null).default(null),
    address: Joi.object({
      id: Joi.string().guid().optional().allow(null).default(null),
      companyName: Joi.string().allow(null),
      email: Joi.string().email().allow(null),
      costCenter: Joi.string().allow(null),
      country: Joi.string().required().valid(...countryList.countries).max(64),
      city: Joi.string().required().max(64),
      street: Joi.string().optional().allow('').allow(null).max(64),
      zip: Joi.string().optional().max(24),
      phone: Joi.string().optional().allow('').allow(null).regex(phoneValidationPattern)
        .messages({
          'string.pattern.base': '{#label} must be numeric'
        }),
      addressAddition: Joi.string().allow('').allow(null).max(255),
      vat: Joi.string().allow('').allow(null).max(24),
      type: Joi.string().valid(...['billing', 'delivery', 'billingAndDelivery']).allow(null).default(null),
      affiliation: Joi.string().optional().valid(...['personal', 'company', 'other']).allow(null).default('personal')
    }).optional().allow(null).default(null)
  }).required()
}).required()

const validateRole = Joi.object({
  user: Joi.object({
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.ADMIN, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER])
      .required()
  }).required()
}).required()

const validateEmailVerification = Joi.object({
  user: Joi.object({
    isVerified: Joi.bool()
      .required()
  }).required()
}).required()

const validateUserActivation = Joi.object({
  user: Joi.object({
    isActive: Joi.bool()
      .required()
  }).required()
}).required()

const validateUserCompanyRole = Joi.object({
  user: Joi.object({
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER])
      .required()
  }).required()
}).required()

const validateUserCompanyAndRole = Joi.object({
  user: Joi.object({
    companyId: Joi.string().uuid().allow(null).required(),
    role: Joi.string()
      .when('companyId', {
        is: null,
        then: Joi.string().when(Joi.ref('role'), {
          is: userRoles.ADMIN,
          then: Joi.valid(
            userRoles.ADMIN,
            userRoles.USER,
            userRoles.EMPLOYEE,
            userRoles.COMPANYADMINISTRATOR,
            userRoles.CAMPAIGNMANAGER
          ),
          otherwise: Joi.valid(userRoles.USER)
        }),
        otherwise: Joi.string().valid(
          userRoles.ADMIN,
          userRoles.USER,
          userRoles.EMPLOYEE,
          userRoles.COMPANYADMINISTRATOR,
          userRoles.CAMPAIGNMANAGER
        )
      }).default(userRoles.USER)
  }).required()
}).required()

const validatePassword = Joi.object({
  user: Joi.object({
    currentPassword: Joi.string().required(),
    password: Joi.string().min(6).max(64).required()
  }).required()
}).required()

const validatePasswordReset = Joi.object({
  user: Joi.object({
    password: Joi.string().min(6).max(64).required()
  }).required()
}).required()

const validateUserPhoto = Joi.object({
  user: Joi.object({
    photo: Joi.object({
      url: Joi.string().uri().required(),
      filename: Joi.string().required()
    }).required()
  }).required()
}).required()

const validateEmail = Joi.object({
  user: Joi.object({
    email: Joi.string().email().lowercase().required()
  }).required()
}).required()

const validateOtp = Joi.object({
  user: Joi.object({
    email: Joi.string().email().lowercase().required(),
    otp: Joi.number().required()
  }).required()
}).required()

const validateUUID = Joi.object().keys({
  id: Joi.string().uuid(),
  userId: Joi.string().uuid()
}).required()

const validateTrackingId = Joi.object().keys({
  trackingId: Joi.string()
}).required()

const validateProductId = Joi.object().keys({
  id: Joi.alternatives().try(Joi.string().uuid(), Joi.string().length(11))
}).required()

const commonQueryParams = {
  limit: Joi.number().optional(),
  page: Joi.number().optional(),
  offset: Joi.number().optional(),
  search: Joi.any().optional(),
  pageToken: Joi.any().optional(),
  filter: Joi.object({
    firstname: Joi.string().optional(),
    lastname: Joi.string().optional(),
    email: Joi.string().email().optional(),
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER, userRoles.ADMIN]).optional(),
    city: Joi.string().optional(),
    country: Joi.string().length(2).optional(),
    company: Joi.string().optional(),
    companyId: Joi.string().uuid(),
    type: Joi.string().optional(),
    isParent: Joi.string().trim().lowercase()
      .valid(...['true', 'false', 'true,false', 'false,true', 'true, false', 'false, true']),
    category: Joi.string().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    color: Joi.string().optional().lowercase(),
    material: Joi.string().optional().lowercase(),
    size: Joi.string().optional().lowercase(),
    tags: Joi.string()
      .lowercase()
      .pattern(/^([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12},?)+$/i)
      .messages({
        'string.pattern.base': '{#label} must be valid uuids separated by commas'
      })
      .optional(),
    showChildren: Joi.string().trim().lowercase().valid(...['true', 'false']),
    showParent: Joi.string().trim().lowercase().valid(...['true', 'false']),
    price: Joi.string().pattern(/^\d+-\d+(?:,\d+-\d+)*$/)
      .messages({
        'string.pattern.base': '{#label} must contain valid ranges separated by commas'
      }).optional(),
    affiliation: Joi.string().optional(),
    isBillOfMaterials: Joi.string().trim().lowercase().valid(...['true', 'false']),
    isHidden: Joi.string().trim().lowercase().valid(...['true', 'false'])
  }).optional()
}
const validateQueryParams = Joi.object({ ...commonQueryParams }).required()

const validateProductQueryParams = Joi.object({
  ...commonQueryParams,
  orderBy: Joi.object({
    name: Joi.string().valid(...['asc', 'desc']),
    price: Joi.string().valid(...['asc', 'desc']),
    createdAt: Joi.string().valid(...['asc', 'desc'])
  }).optional(),
  select: Joi.string().custom((value, helpers) => {
    const isValid = value.replace(/\s+/g, '').split(',')
      .every((option: string) => productSelectedColumns.replace(/\s+/g, '').split(',').includes(option))

    if (isValid === false) {
      return helpers.error('any.invalid')
    }

    return value
  }, 'Comma separated list validation').message(`select must be one of [${productSelectedColumns}]`)
})

const validateInvoiceQueryParams = Joi.object({
  ...commonQueryParams,
  sortBy: Joi.object({
    dueDate: Joi.string().valid(...['asc', 'desc']),
    createdAt: Joi.string().valid(...['asc', 'desc']),
    deliveryDate: Joi.string().valid(...['asc', 'desc']),
    documentDate: Joi.string().valid(...['asc', 'desc'])
  }),
  filter: Joi.object({
    status: Joi.string().valid(...['open', 'paid', 'overdue', 'draft', 'sent', 'cancelled'])
  }).optional()
}).required()

const validateNotifications = Joi.object({
  user: Joi.object({
    notifications: Joi.object({
      isEnabled: Joi.boolean().optional()
    })
  })
}).required()

const validateCreatedCompany = Joi.object({
  company: Joi.object({
    name: Joi.string().required().max(64),
    suffix: Joi.string().max(32).allow('').allow(null),
    email: Joi.string().email().lowercase().required().max(128),
    phone: Joi.string().optional().allow('').allow(null).regex(phoneValidationPattern)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    vat: Joi.string().optional().max(24).allow('').allow(null),
    domain: Joi.string().domain().allow('').allow(null),
    customerId: Joi.number().optional().allow('').allow(null),
    isDocumentGenerationEnabled: Joi.boolean().optional().default(false),
    defaultProductCategoriesHidden: Joi.boolean().optional().default(false)
  }).required()
}).required()

const validateUpdatedCompany = Joi.object({
  company: Joi.object({
    name: Joi.string().optional().max(64),
    suffix: Joi.string().max(32).allow('').allow(null),
    email: Joi.string().email().lowercase().optional().max(128),
    phone: Joi.string().optional().allow('').allow(null).regex(phoneValidationPattern)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    vat: Joi.string().optional().max(24).allow('').allow(null),
    domain: Joi.string().domain().allow('').allow(null),
    customerId: Joi.number().optional().allow('').allow(null),
    isDocumentGenerationEnabled: Joi.boolean().optional().default(false),
    defaultProductCategoriesHidden: Joi.boolean().optional().default(false)
  }).required()
}).required()

const validateDomain = Joi.object({
  company: Joi.object({
    isDomainVerified: Joi.boolean().required()
  }).required()
}).required()

const validateCreatedAddress = Joi.object({
  address: Joi.object({
    id: Joi.string().uuid().optional().default(null).allow(null),
    salutation: Joi.string().optional().allow('').allow(null).max(64),
    title: Joi.string().optional().allow('').allow(null).max(32),
    firstName: Joi.string().optional().allow('').allow(null).max(64),
    lastName: Joi.string().optional().allow('').allow(null).max(64),
    companyName: Joi.string().allow(null),
    email: Joi.string().email().allow(null),
    costCenter: Joi.string().allow(null),
    country: Joi.string().required().valid(...countryList.countries).max(64),
    city: Joi.string().required().max(64),
    street: Joi.string().optional().allow('').allow(null).max(64),
    zip: Joi.string().optional().max(24),
    phone: Joi.string().optional().allow('').allow(null).regex(phoneValidationPattern)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    addressAddition: Joi.string().allow('').allow(null).max(255),
    vat: Joi.string().allow('').allow(null).max(24),
    type: Joi.string().valid(...['billing', 'delivery', 'billingAndDelivery']).allow(null).default('delivery'),
    affiliation: Joi.string().optional().valid(...['personal', 'company', 'other']).allow(null)
  }).required()
}).required()

const validateUpdatedAddress = Joi.object({
  address: Joi.object({
    salutation: Joi.string().optional().allow('').allow(null).max(64),
    title: Joi.string().optional().allow('').allow(null).max(32),
    firstName: Joi.string().optional().allow('').allow(null).max(64),
    lastName: Joi.string().optional().allow('').allow(null).max(64),
    companyName: Joi.string().allow(null),
    email: Joi.string().email().allow(null),
    costCenter: Joi.string().allow(null),
    country: Joi.string().optional().valid(...countryList.countries).max(64),
    city: Joi.string().optional().max(64),
    street: Joi.string().optional().allow('').allow(null).max(64),
    zip: Joi.string().optional().max(24),
    phone: Joi.string().optional().allow('').allow(null).regex(phoneValidationPattern)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    addressAddition: Joi.string().allow('').allow(null).max(255),
    vat: Joi.string().allow('').allow(null).max(24),
    type: Joi.string().valid(...['billing', 'delivery', 'billingAndDelivery']).allow(null).default('delivery'),
    affiliation: Joi.string().optional().valid(...['personal', 'company', 'other']).allow(null)
  }).required()
}).required()

const validateCreatedRecipient = Joi.object({
  recipient: Joi.object({
    companyName: Joi.string().optional().allow('').allow(null).max(64),
    salutation: Joi.string().optional().allow('').allow(null).max(64),
    title: Joi.string().optional().allow('').allow(null).max(32),
    firstName: Joi.string().optional().allow('').allow(null).max(64),
    lastName: Joi.string().optional().allow('').allow(null).max(64),
    email: Joi.string().email().lowercase().optional().allow('').allow(null).max(128),
    phone: Joi.string().optional().allow('').allow(null).regex(phoneValidationPattern)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    country: Joi.string().required().valid(...countryList.countries).max(64),
    city: Joi.string().required().max(64),
    street: Joi.string().optional().allow('').allow(null).max(64),
    zip: Joi.string().optional().max(24),
    addressAddition: Joi.string().optional().allow('').allow(null).max(255),
    costCenter: Joi.string().optional().allow('').allow(null),
    startDate: Joi.date().allow(null).default(null),
    birthDate: Joi.date().allow(null).default(null),
    hireDate: Joi.date().allow(null).default(null),
    releaseDate: Joi.date().allow(null).default(null)
  }).required()
}).required()

const validateUpdatedRecipient = Joi.object({
  recipient: Joi.object({
    companyName: Joi.string().optional().allow('').allow(null).max(64),
    salutation: Joi.string().optional().allow('').allow(null).max(64),
    title: Joi.string().optional().allow('').allow(null).max(32),
    firstName: Joi.string().optional().allow('').allow(null).max(64),
    lastName: Joi.string().optional().allow('').allow(null).max(64),
    email: Joi.string().email().lowercase().optional().allow('').allow(null).max(128),
    phone: Joi.string().optional().allow('').allow(null).regex(phoneValidationPattern)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    country: Joi.string().optional().valid(...countryList.countries).max(64),
    city: Joi.string().optional().max(64),
    street: Joi.string().optional().allow('').allow(null).max(64),
    zip: Joi.string().optional().max(24),
    addressAddition: Joi.string().optional().allow('').allow(null).max(255),
    costCenter: Joi.string().optional().allow('').allow(null),
    startDate: Joi.date().allow(null).default(null),
    birthDate: Joi.date().allow(null).default(null),
    hireDate: Joi.date().allow(null).default(null),
    releaseDate: Joi.date().allow(null).default(null)
  }).required()
}).required()

const commonCampaignSchema = {
  name: Joi.string().required().allow('').allow(null).max(64),
  status: Joi.string().required().valid(...['draft', 'submitted']),
  type: Joi.string().required().valid(...['onboarding', 'birthday', 'christmas', 'marketing']),
  description: Joi.string().allow(null).allow('').max(1024)
}

const validateCampaign = Joi.object({
  campaign: Joi.object({
    ...commonCampaignSchema
  }).required()
}).required()

const validateCampaignAdmin = Joi.object({
  campaign: Joi.object({
    ...commonCampaignSchema,
    correctionQuota: Joi.number(),
    lastQuotaResetDate: Joi.date().allow(null),
    isQuotaEnabled: Joi.boolean(),
    isExceedQuotaEnabled: Joi.boolean(),
    isExceedStockEnabled: Joi.boolean(),
    isNoteEnabled: Joi.boolean(),
    isActive: Joi.boolean(),
    isHidden: Joi.boolean(),
    isBulkCreateEnabled: Joi.boolean(),
    shippingMethodType: Joi.number().allow(null).default(null),
    shippingMethodIsDropShipping: Joi.boolean(),
    includeStartDate: Joi.boolean()
  }).required()
}).required()

const validateJoinCompany = Joi.object({
  user: Joi.object({
    email: Joi.string().email().lowercase().required().max(128),
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER]),
    actionType: Joi.string().valid(...['remove', 'add']).default('add')
  }).required()
}).required()

const validateSalutation = Joi.object({
  salutation: Joi.object({
    name: Joi.string().required().max(64)
  }).required()
}).required()

const validatePrivacyRule = Joi.object({
  privacyRule: Joi.object({
    module: Joi.string().required().valid(...appModules.MODULES_ARRAY),
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER])
      .required(),
    isEnabled: Joi.boolean()
  }).required()
}).required()

const validateSecondaryDomain = Joi.object({
  secondaryDomain: Joi.object({
    name: Joi.string().domain()
  }).required()
}).required()

const validateCostCenter = Joi.object({
  costCenter: Joi.object({
    center: Joi.string().required()
  }).required()
}).required()

const validateBundle = Joi.object({
  bundle: Joi.object({
    jfsku: Joi.string().allow('').allow(null).max(20),
    merchantSku: Joi.string().allow('').allow(null).max(40),
    name: Joi.string().required().max(128),
    description: Joi.string().allow(null).allow('').max(1024),
    price: Joi.number().max(1000000).min(0),
    isLocked: Joi.boolean(),
    isBillOfMaterials: Joi.boolean(),
    shippingMethodType: Joi.number().allow(null).default(null),
    specifications: Joi.object({
      isBatch: Joi.boolean().default(false),
      isDivisible: Joi.boolean().default(false),
      isBestBefore: Joi.boolean().default(false),
      isPackaging: Joi.boolean().default(false),
      isSerialNumber: Joi.boolean().default(false),
      isBillOfMaterials: Joi.boolean().default(false),
      billOfMaterialsComponents: Joi.array().items(
        Joi.object({
          name: Joi.string().required().max(128),
          jfsku: Joi.string().required().max(20),
          merchantSku: Joi.string().required().max(40),
          quantity: Joi.number().positive().default(1)
        })
      ).min(1).required()
    }).default(null)
  }).required()
}).required()

const validatePicture = Joi.object({
  picture: Joi.object({
    url: Joi.string().uri().required(),
    filename: Joi.string().required(),
    size: Joi.number(),
    mimeType: Joi.string().valid(...imageMimeTypes).allow(null).allow('')
  }).required()
}).required()

const validateProduct = Joi.object({
  product: Joi.object({
    name: Joi.string().required().max(128),
    jfsku: Joi.string().required().max(64),
    merchantSku: Joi.string().required().max(64),
    productGroup: Joi.string().required().max(64),
    type: Joi.string().required().valid(...['generic', 'custom']),
    netRetailPrice: Joi.object({
      amount: Joi.number(),
      currency: Joi.string().required().valid(...currencies.currencies),
      discount: Joi.number()
    }),
    isParent: Joi.boolean(),
    productColorId: Joi.string().uuid().allow(null),
    productMaterialId: Joi.string().uuid().allow(null),
    productSizeId: Joi.string().uuid().allow(null),
    description: Joi.string().max(defaultTextLength).allow(null).allow('').optional(),
    isExceedStockEnabled: Joi.boolean()
  }).required()
}).required()

const validateProductUpdate = Joi.object({
  product: Joi.object({
    name: Joi.string().max(128),
    jfsku: Joi.string().max(64),
    merchantSku: Joi.string().max(64),
    productGroup: Joi.string().max(64),
    type: Joi.string().valid(...['generic', 'custom']),
    netRetailPrice: Joi.object({
      amount: Joi.number(),
      currency: Joi.string().required().valid(...currencies.currencies),
      discount: Joi.number()
    }),
    isParent: Joi.boolean(),
    productColorId: Joi.string().uuid().allow(null),
    productMaterialId: Joi.string().uuid().allow(null),
    productSizeId: Joi.string().uuid().allow(null),
    description: Joi.string().max(defaultTextLength).allow(null).allow('').optional(),
    minimumOrderQuantity: Joi.number().min(1),
    isExceedStockEnabled: Joi.boolean().default(false)
  }).required()
}).required()

const validateProductAdmin = Joi.object({
  product: Joi.object({
    companyId: Joi.string().uuid().allow(null).default(null),
    isVisible: Joi.bool().default(true),
    name: Joi.string().required().max(64),
    jfsku: Joi.string().required().max(64),
    merchantSku: Joi.string().required().max(64),
    productGroup: Joi.string().required().max(64),
    type: Joi.string().required().valid(...['generic', 'custom']),
    netRetailPrice: Joi.object({
      amount: Joi.number(),
      currency: Joi.string().required().valid(...currencies.currencies),
      discount: Joi.number()
    }),
    isParent: Joi.boolean(),
    productColorId: Joi.string().uuid().allow(null),
    productMaterialId: Joi.string().uuid().allow(null),
    productSizeId: Joi.string().uuid().allow(null),
    description: Joi.string().allow(null).allow('').optional().max(255),
    minimumOrderQuantity: Joi.number().min(1),
    isExceedStockEnabled: Joi.boolean().default(false)
  }).required()
}).required()

const validateProductCompany = Joi.object({
  product: Joi.object({
    companyId: Joi.string().uuid().allow(null).default(null)
  }).required()
}).required()

const validateOrder = Joi.object({
  order: Joi.object({
    outboundId: Joi.string().required(),
    fulfillerId: Joi.string().required(),
    merchantOutboundNumber: Joi.string().required(),
    warehouseId: Joi.string().required(),
    status: Joi.string().required(),
    shippingAddress: Joi.object({
      company: Joi.string(),
      lastname: Joi.string(),
      city: Joi.string().required(),
      email: Joi.string(),
      firstname: Joi.string(),
      street: Joi.string().required(),
      zip: Joi.string().required(),
      country: Joi.string().required()
    }),
    items: Joi.array().items(
      Joi.object({
        jfsku: Joi.string().required().max(20),
        outboundItemId: Joi.string().required(),
        name: Joi.string().required().max(128),
        merchantSku: Joi.string().required().max(40),
        quantity: Joi.number().positive(),
        itemType: Joi.string().required().valid(...['BillOfMaterials', 'Product']),
        quantityOpen: Joi.number().positive(),
        externalNumber: Joi.string().allow('').allow(null),
        price: Joi.number(),
        vat: Joi.number(),
        billOfMaterialsId: Joi.string()
      })
    ).min(1),
    senderAddress: Joi.object({
      company: Joi.string(),
      city: Joi.string().required(),
      email: Joi.string(),
      street: Joi.string().required(),
      zip: Joi.string().required(),
      country: Joi.string().required(),
      phone: Joi.string().required().allow(null).allow('')
    }),
    attributes: Joi.array().items(
      Joi.object(
        {
          key: Joi.string(),
          value: Joi.string(),
          attributeType: Joi.string()
        }
      )
    ),
    priority: Joi.number(),
    currency: Joi.string(),
    externalNote: Joi.string(),
    salesChannel: Joi.string(),
    desiredDeliveryDate: Joi.date(),
    shippingMethodId: Joi.string(),
    shippingType: Joi.string(),
    shippingFee: Joi.number(),
    orderValue: Joi.number(),
    attachments: Joi.any(),
    modificationInfo: Joi.any()
  })
}).required()

const validateOrderUpdate = Joi.object({
  order: Joi.object({
    isVisible: Joi.boolean()
  })
}).required()

const validateLegalText = Joi.object({
  legalText: Joi.object({
    type: Joi.string().required().valid(...['privacy', 'terms', 'defaultPrivacy', 'defaultTerms']),
    template: Joi.object({
      title: Joi.string().required().max(128),
      sections: Joi.array().items(
        Joi.object({
          title: Joi.string().required(),
          content: Joi.string().required()
        }).required()
      ).min(1).required()
    }).required()
  }).required()
}).required()

const validateRegistrationQueryParams = Joi.object({
  companyId: Joi.string()
}).required()

const validateShippingMethod = Joi.object({
  shippingMethod: Joi.object({
    name: Joi.string().required().max(128),
    shippingType: Joi.number().required(),
    isDropShipping: Joi.boolean().required(),
    insuranceValue: Joi.number().allow(null)
  }).required()
}).required()

const commonPendingOrderSchema = {
  platform: Joi.number().equal(0),
  language: Joi.number().equal(0),
  currency: Joi.string(),
  orderNo: Joi.string(),
  projectNumber: Joi.string().allow('').allow(null),
  inetorderno: Joi.number().equal(0),
  shippingId: Joi.number(),
  shipped: Joi.date().min(dayjs().utc().subtract(1, 'day').toDate()),
  deliverydate: Joi.date().min(Joi.ref('shipped')),
  note: Joi.string().allow('').allow(null),
  description: Joi.string().allow('').allow(null),
  costCenter: Joi.string().allow('').allow(null),
  paymentType: Joi.number().equal(0),
  paymentTarget: Joi.number().equal(0),
  discount: Joi.number().equal(0),
  orderStatus: Joi.number().equal(0),
  quantity: Joi.number().positive().default(1),
  orderLineRequests: Joi.array().items(
    Joi.object({
      itemName: Joi.string(),
      articleNumber: Joi.string(),
      itemNetSale: Joi.number(),
      itemVAT: Joi.number(),
      quantity: Joi.number().positive(),
      type: Joi.number(),
      discount: Joi.number(),
      netPurchasePrice: Joi.number()
    })
  ).min(1).required(),
  shippingAddressRequests: Joi.array().items(
    Joi.object({
      salutation: Joi.string().allow('').allow(null),
      firstName: Joi.string(),
      lastName: Joi.string(),
      title: Joi.string().allow('').allow(null),
      company: Joi.string().allow('').allow(null),
      companyAddition: Joi.string().allow('').allow(null),
      street: Joi.string(),
      addressAddition: Joi.string().allow('').allow(null),
      zipCode: Joi.string(),
      place: Joi.string(),
      phone: Joi.string().allow('').allow(null),
      state: Joi.string().allow('').allow(null),
      country: Joi.string(),
      iso: Joi.string().allow('').allow(null),
      telephone: Joi.string().allow('').allow(null),
      mobile: Joi.string().allow('').allow(null),
      fax: Joi.string().allow('').allow(null),
      email: Joi.string(),
      costCenter: Joi.string().allow('').allow(null).default(null),
      startDate: Joi.date().allow(null).default(null)
    })
  ).min(1).required(),
  billingAddressRequests: Joi.array().items(
    Joi.object({
      salutation: Joi.string().allow('').allow(null),
      firstName: Joi.string().allow('').allow(null),
      lastName: Joi.string().allow('').allow(null),
      title: Joi.string().allow('').allow(null),
      company: Joi.string().allow('').allow(null),
      companyAddition: Joi.string().allow('').allow(null),
      street: Joi.string(),
      addressAddition: Joi.string().allow('').allow(null),
      zipCode: Joi.string(),
      place: Joi.string(),
      phone: Joi.string().allow('').allow(null),
      state: Joi.string().allow('').allow(null),
      country: Joi.string(),
      iso: Joi.string().allow('').allow(null),
      telephone: Joi.string().allow('').allow(null),
      mobile: Joi.string().allow('').allow(null),
      fax: Joi.string().allow('').allow(null),
      email: Joi.string(),
      costCenter: Joi.string().allow('').allow(null)
    })
  ).optional(),
  paymentInformationRequests: Joi.array().items(
    Joi.object({
      bankName: Joi.string(),
      blz: Joi.string(),
      accountno: Joi.string(),
      cardno: Joi.string(),
      validity: Joi.date(),
      cvv: Joi.string(),
      cardType: Joi.string(),
      owner: Joi.string(),
      iban: Joi.string(),
      bic: Joi.string()
    })
  )
}
const validatePendingOrders = Joi.object({
  pendingOrders: Joi.array().items(
    Joi.object({ ...commonPendingOrderSchema })
  ).min(1).required()
}).required()

const validatePendingOrderUpdate = Joi.object({
  pendingOrder: Joi.object({
    shipped: Joi.date().min(dayjs().utc().subtract(1, 'day').toDate()),
    deliverydate: Joi.date().min(Joi.ref('shipped')),
    note: Joi.string().allow('').allow(null),
    description: Joi.string().allow('').allow(null),
    costCenter: Joi.string().allow('').allow(null),
    shippingAddressRequests: Joi.array().items(
      Joi.object({
        salutation: Joi.string().allow('').allow(null),
        firstName: Joi.string(),
        lastName: Joi.string(),
        title: Joi.string().allow('').allow(null),
        company: Joi.string().allow('').allow(null),
        companyAddition: Joi.string().allow('').allow(null),
        street: Joi.string(),
        addressAddition: Joi.string().allow('').allow(null),
        zipCode: Joi.string(),
        place: Joi.string(),
        phone: Joi.string().allow('').allow(null),
        state: Joi.string().allow('').allow(null),
        country: Joi.string(),
        iso: Joi.string().allow('').allow(null),
        telephone: Joi.string().allow('').allow(null),
        mobile: Joi.string().allow('').allow(null),
        fax: Joi.string().allow('').allow(null),
        email: Joi.string(),
        costCenter: Joi.string().allow('').allow(null).default(null),
        startDate: Joi.date().allow(null).default(null)
      })
    ).min(1).required()
  })
}).required()

const validateCardTemplate = Joi.object({
  cardTemplate: Joi.object({
    name: Joi.string().max(128).allow('').allow(null).required(),
    description: Joi.string().max(128).allow('').allow(null).required(),
    front: Joi.string().allow('').max(defaultTextLength).allow(null).required(),
    back: Joi.string().allow('').max(defaultTextLength).allow(null).required(),
    frontOrientation: Joi.string().allow('').allow(null).valid(...['portrait', 'landscape']),
    backOrientation: Joi.string().allow('').allow(null).valid(...['portrait', 'landscape']),
    isDraft: Joi.boolean().optional().default(true),
    articleId: Joi.string().allow('').allow(null),
    isBarcodeEnabled: Joi.boolean().optional().default(true),
    eanBarcode: Joi.string().regex(/^\d{8}(\d{5}|\d{6})?$/).messages({
      'string.pattern.base': '{#label} must be a valid EAN barcode'
    }).allow('').allow(null),
    upcBarcode: Joi.string().regex(/^\d{8}(\d{4})?$/).messages({
      'string.pattern.base': '{#label} must be a valid UPC barcode'
    }).allow('').allow(null)
  }).required()
}).required()

const validateCardSetting = Joi.object({
  cardSetting: Joi.object({
    isEnabled: Joi.boolean().allow(null),
    isFrontSelectable: Joi.boolean().allow(null),
    isRotationEnabled: Joi.boolean().allow(null),
    isBackEditable: Joi.boolean().allow(null),
    isAutoProcessingEnabled: Joi.boolean().allow(null),
    defaultBack: Joi.string().allow('').max(defaultTextLength).allow(null),
    defaultFront: Joi.string().allow('').max(defaultTextLength).allow(null),
    exportOrientation: Joi.string().allow('').allow(null).valid(...['portrait', 'landscape']),
    exportSides: Joi.string().allow('').allow(null).valid('both', 'front', 'back'),
    supplierEmail: Joi.string().email().allow(null),
    articleId: Joi.string().allow('').allow(null),
    isBarcodeEnabled: Joi.boolean().optional().default(true),
    eanBarcode: Joi.string().regex(/^\d{8}(\d{5}|\d{6})?$/).messages({
      'string.pattern.base': '{#label} must be a valid EAN barcode'
    }).allow('').allow(null),
    upcBarcode: Joi.string().regex(/^\d{8}(\d{4})?$/).allow('').messages({
      'string.pattern.base': '{#label} must be a valid UPC barcode'
    }).allow(null)
  }).required()
}).required()

const validateGreetingCard = Joi.object({
  greetingCard: Joi.object({
    articleNumber: Joi.string().required(),
    articleName: Joi.string().required(),
    url: Joi.string().uri().required(),
    totalStock: Joi.number(),
    inventory: Joi.number(),
    availableStock: Joi.number(),
    jtlfpid: Joi.string().required(),
    companyId: Joi.string().uuid().allow(null).default(null)
  }).required()
}).required()

const validatePostedOrders = Joi.object().keys({
  postedOrders: Joi.array().items(Joi.object({
    orderId: Joi.string().min(17).required(),
    shipped: Joi.date().min(dayjs().utc().subtract(1, 'day').toDate()).required()
  })).min(1).required()
}).required()

const validateAuthToken = Joi.object({
  auth: Joi.object({
    token: Joi.string().required()
  }).required()
}).required()

const validateCampaignOrderLimit = Joi.object({
  campaignOrderLimit: {
    limit: Joi.number().required(),
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER])
      .required()
  }
}).required()

const validateCampaignShippingDestination = Joi.object({
  campaignShippingDestinations: Joi.array().items(Joi.string().required().valid(...countryList.countries)).min(1)
}).required()

const validatePasswordResetAdmin = Joi.object({
  user: Joi.object({
    sendEmail: Joi.boolean().default(true)
  }).required()
}).required()

const validateEmailTemplate = Joi.object({
  emailTemplate: Joi.object({
    subject: Joi.string().max(255).required(),
    template: Joi.string().required(),
    emailTemplateTypeId: Joi.string().uuid().required()
  }).required()
}).required()

const validateEmailTemplateType = Joi.object({
  emailTemplateType: Joi.object({
    name: Joi.string().max(64).required(),
    type: Joi.string().max(32).required(),
    description: Joi.string().max(255).required(),
    placeholders: Joi.array().items(Joi.string().max(16).lowercase()).min(1).required()
  }).required()
}).required()

const validateUserCompanyInvite = Joi.object({
  user: Joi.object({
    companyInviteCode: Joi.string().required()
  }).required()
}).required()

const validateCampaignAddress = Joi.object({
  campaignAddresses: Joi.array().items(
    Joi.object({
      companyName: Joi.string().allow(null),
      email: Joi.string().email().allow(null),
      costCenter: Joi.string().allow(null),
      country: Joi.string().required().valid(...countryList.countries).max(64),
      city: Joi.string().required().max(64),
      street: Joi.string().optional().allow('').allow(null).max(64),
      zip: Joi.string().optional().max(24),
      phone: Joi.string().optional().allow('').allow(null).regex(phoneValidationPattern)
        .messages({
          'string.pattern.base': '{#label} must be numeric'
        }),
      addressAddition: Joi.string().allow('').allow(null).max(255),
      vat: Joi.string().allow('').allow(null).max(24),
      type: Joi.string().valid(...['billing', 'return']).required()
    })).min(1).required()
}).required()

const validateMaintenanceMode = Joi.object({
  maintenanceMode: Joi.object({
    isActive: Joi.boolean().required(),
    reason: Joi.string().required(),
    startDate: Joi.date().when('isActive', {
      is: true,
      then: Joi.date().min(dayjs().toDate()),
      otherwise: Joi.date()
    }).required(),
    endDate: Joi.date()
      .min(Joi.ref('startDate'))
      .not(Joi.ref('startDate')).messages({
        'any.invalid': 'End date must not be equal to start date'
      })
      .messages({
        'date.min': 'End date must be after start date'
      }).required()
  }).required()
}).required()

const validateCompanyTheme = Joi.object({
  company: Joi.object({
    theme: Joi.object({
      primaryColor: Joi.string().required().regex(/^#[A-Fa-f0-9]{6}$/).messages({
        'string.pattern.base': '{#label} must be a valid hex color'
      }),
      secondaryColor: Joi.string().required().regex(/^#[A-Fa-f0-9]{6}$/).messages({
        'string.pattern.base': '{#label} must be a valid hex color'
      }),
      backgroundColor: Joi.string().required().regex(/^#[A-Fa-f0-9]{6}$/).messages({
        'string.pattern.base': '{#label} must be a valid hex color'
      }),
      foregroundColor: Joi.string().required().regex(/^#[A-Fa-f0-9]{6}$/).messages({
        'string.pattern.base': '{#label} must be a valid hex color'
      }),
      accentColor: Joi.string().required().regex(/^#[A-Fa-f0-9]{6}$/).messages({
        'string.pattern.base': '{#label} must be a valid hex color'
      })
    }).allow(null)
  }).required()
}).required()

const validateCompanyLogo = Joi.object({
  company: Joi.object({
    logo: Joi.object({
      url: Joi.string().uri().required(),
      filename: Joi.string().required()
    }).allow(null)
  }).required()
}).required()

const validateCompanySubscription = Joi.object({
  companySubscription: Joi.object({
    plan: Joi.string().required().valid(...['premium', 'basic', 'custom', 'trial']),
    description: Joi.string().required().max(64),
    startDate: Joi.date().min(dayjs().toDate()).required(),
    endDate: Joi.date()
      .min(Joi.ref('startDate'))
      .not(Joi.ref('startDate')).messages({
        'any.invalid': 'End date must not be equal to start date'
      })
      .messages({
        'date.min': 'End date must be after start date'
      }).required(),
    autoRenew: Joi.boolean().default(false)
  }).required()
})

const validateProductCategory = Joi.object({
  productCategory: Joi.object({
    name: Joi.string().lowercase().required().max(64),
    description: Joi.string().max(255).allow(null).allow(''),
    picture: Joi.object({
      url: Joi.string().uri().required(),
      filename: Joi.string().required()
    }).allow(null),
    sortIndex: Joi.number().positive().allow(0),
    isHidden: Joi.boolean().default(false),
    companyId: Joi.string().uuid().allow(null).default(null)
  }).required()
})

const validateProductCategoryUpdate = Joi.object({
  productCategory: Joi.object({
    name: Joi.string().lowercase().required().max(64),
    description: Joi.string().max(255).allow(null).allow(''),
    picture: Joi.object({
      url: Joi.string().uri().required(),
      filename: Joi.string().required()
    }).allow(null),
    sortIndex: Joi.number().positive().allow(0),
    isHidden: Joi.boolean(),
    companyId: Joi.string().uuid().allow(null)
  }).required()
})

const validateProductCategoryForCompany = Joi.object({
  productCategory: Joi.object({
    name: Joi.string().lowercase().required().max(64),
    description: Joi.string().max(255).allow(null).allow(''),
    picture: Joi.object({
      url: Joi.string().uri().required(),
      filename: Joi.string().required()
    }).allow(null),
    sortIndex: Joi.number().positive().allow(0),
    isHidden: Joi.boolean().default(false)
  }).required()
})

const validateProductColor = Joi.object({
  productColor: Joi.object({
    name: Joi.string().lowercase().required(),
    hexCode: Joi.string().regex(/^#[A-Fa-f0-9]{6}$/).messages({
      'string.pattern.base': '{#label} must be a valid hex color'
    }).required(),
    rgb: Joi.string().regex(/^rgb\(\s?\d{1,3}\s?,\s?\d{1,3}\s?,\s?\d{1,3}\s?\)$/).message('{#label} must be a valid RGB color').allow(null).default(null)
  }).required()
})

const validateProductMaterial = Joi.object({
  productMaterial: Joi.object({
    name: Joi.string().lowercase().required()
  }).required()
})

const validateProductSize = Joi.object({
  productSize: Joi.object({
    name: Joi.string().max(32).lowercase().required(),
    type: Joi.string().max(32).allow(null).default(null),
    sortIndex: Joi.number().positive().allow(0)
  }).required()
})

const validateProductCategoryTag = Joi.object({
  productCategoryTag: Joi.object({
    name: Joi.string().lowercase().required(),
    type: Joi.string().lowercase().optional().default('category')
  }).required()
})

const validateProductTag = Joi.object({
  productTag: Joi.object({
    productCategoryTagIds: Joi.array().items(Joi.string().uuid()).required()
  }).required()
})

const validateChild = Joi.object({
  product: Joi.object({
    parentId: Joi.string().uuid().required()
  }).required()
})

const validateChildren = Joi.object({
  product: Joi.object({
    childIds: Joi.array().items(Joi.string().uuid()).required()
  }).required()
})

const validateGraduatedPrice = Joi.object({
  productGraduatedPrice: Joi.object({
    firstUnit: Joi.number().required().min(1),
    lastUnit: Joi.number().required().min(Joi.ref('firstUnit'))
      .not(Joi.ref('firstUnit')).messages({
        'any.invalid': 'Last unit must not be equal to first unit'
      }),
    price: Joi.number().min(0)
  }).required()
})

const validateProductAccessControlGroup = Joi.object({
  productAccessControlGroup: Joi.object({
    name: Joi.string().required().max(255),
    description: Joi.string().optional().max(255).allow(null).allow(''),
    companyId: Joi.string().uuid().allow(null).default(null)
  }).required()
})

const validateProductCategoryTagProductAccessControlGroup = Joi.object({
  productCategoryTagProductAccessControlGroup: Joi.object({
    productCategoryTagIds: Joi.array().items(Joi.string().uuid().required()).min(1)
  }).required()
})

const validateUserProductAccessControlGroup = Joi.object({
  userProductAccessControlGroup: Joi.object({
    userIds: Joi.array().items(Joi.string().uuid().required()).min(1)
  }).required()
})

const validateCompanyProductAccessControlGroup = Joi.object({
  companyProductAccessControlGroup: Joi.object({
    companyIds: Joi.array().items(Joi.string().uuid().required()).min(1)
  }).required()
})

const validateCompanyUserGroup = Joi.object({
  companyUserGroup: Joi.object({
    name: Joi.string().required().max(255),
    description: Joi.string().optional().max(255).allow(null).allow(''),
    companyId: Joi.string().uuid().required()
  }).required()
})
const validateUpdatedCompanyUserGroup = Joi.object({
  companyUserGroup: Joi.object({
    name: Joi.string().required().max(255),
    description: Joi.string().optional().max(255).allow(null).allow('')
  }).required()
})

const validateUserCompanyUserGroup = Joi.object({
  userCompanyUserGroup: Joi.object({
    userIds: Joi.array().items(Joi.string().uuid().required()).min(1)
  }).required()
})
const validateCompanyUserGroupProductAccessControlGroup = Joi.object({
  companyUserGroupProductAccessControlGroup: Joi.object({
    companyUserGroupIds: Joi.array().items(Joi.string().uuid().required()).min(1)
  }).required()
})

const validateTaxRate = Joi.object({
  taxRate: Joi.object({
    publicId: Joi.number().required(),
    name: Joi.string().required().max(64),
    zone: Joi.string().required().max(64),
    countryCode: Joi.string().length(2).allow(null),
    rate: Joi.number().positive()
  }).required()
}).required()

const validateTaxRateUpdate = Joi.object({
  taxRate: Joi.object({
    name: Joi.string().max(64),
    zone: Joi.string().max(64),
    countryCode: Joi.string().length(2).allow(null),
    rate: Joi.number().positive()
  }).required()
}).required()

const validateMassUnit = Joi.object({
  massUnit: Joi.object({
    publicId: Joi.number().required(),
    name: Joi.string().required().max(64).allow(null),
    code: Joi.string().required().max(64),
    displayCode: Joi.string().max(64).allow(null),
    referenceMassUnit: Joi.number(),
    referenceMassUnitFactor: Joi.number()
  }).required()
}).required()

const validateMassUnitUpdate = Joi.object({
  massUnit: Joi.object({
    name: Joi.string().max(64).allow(null),
    code: Joi.string().max(64),
    displayCode: Joi.string().max(64).allow(null),
    referenceMassUnit: Joi.number(),
    referenceMassUnitFactor: Joi.number()
  }).required()
}).required()

const validateSalesUnit = Joi.object({
  salesUnit: Joi.object({
    publicId: Joi.number().required(),
    name: Joi.string().required().max(64).allow(null),
    unit: Joi.number().required().positive()
  }).required()
}).required()

const validateSalesUnitUpdate = Joi.object({
  salesUnit: Joi.object({
    publicId: Joi.number(),
    name: Joi.string().max(64).allow(null),
    unit: Joi.number().positive()
  }).required()
}).required()

const validateProductCategoryProducts = Joi.object({
  productCategory: Joi.object({
    productIds: Joi.array().items(Joi.string().uuid().required()).min(1)
  }).required()
})

const validateCompanyInviteToken = Joi.object({
  companyInviteToken: Joi.object({
    roles: Joi.array()
      .items(Joi.string().valid(...[userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER])).min(1)
  }).required()
})

const validateCompanyInviteDomainCheck = Joi.object({
  companyInviteToken: Joi.object({
    roles: Joi.object({
      [userRoles.EMPLOYEE]: Joi.boolean(),
      [userRoles.CAMPAIGNMANAGER]: Joi.boolean(),
      [userRoles.COMPANYADMINISTRATOR]: Joi.boolean()
    }).required()
  }).required()
})

const validateProductCategorySortOrder = Joi.object({
  productCategories: Joi.array().items(
    Joi.object({
      productCategoryId: Joi.string().uuid().required(),
      sortIndex: Joi.number().positive().required().allow(0)
    })
  ).min(1).required()
})

const validateArticleItem = Joi.object({
  item: Joi.object({
    categories: Joi.array().items(
      Joi.object({
        categoryId: Joi.number().positive().required()
      })
    ).min(1).required(),
    name: Joi.string().required(),
    sku: Joi.string(),
    manufacturerId: Joi.number().positive(),
    responsiblePersonId: Joi.number().positive(),
    description: Joi.string(),
    shortDescription: Joi.string(),
    identifiers: Joi.object({
      gtin: Joi.string(),
      manufacturerNumber: Joi.string(),
      isbn: Joi.string(),
      upc: Joi.string(),
      amazonFnsku: Joi.string(),
      asins: Joi.array().items(Joi.string()),
      ownIdentifier: Joi.string()
    }),
    components: Joi.array().items(
      Joi.object({
        itemId: Joi.number().positive().required(),
        quantity: Joi.number().positive().required(),
        sortNumber: Joi.number()
      })
    ),
    itemPriceData: Joi.object({
      salesPriceNet: Joi.number().positive(),
      suggestedRetailPrice: Joi.number().positive(),
      purchasePriceNet: Joi.number().positive(),
      ebayPrice: Joi.number().positive(),
      amazonPrice: Joi.number().positive()
    }),
    activeSalesChannels: Joi.string(),
    sortNumber: Joi.number().positive().allow(0),
    annotation: Joi.string(),
    releasedOnDate: Joi.date(),
    storageOptions: Joi.object({
      inventoryManagementActive: Joi.boolean(),
      splitQuantity: Joi.boolean(),
      globalMinimumStockLevel: Joi.number().positive().allow(0),
      buffer: Joi.number().positive().allow(0),
      serialNumberItem: Joi.boolean(),
      serialNumberTracking: Joi.boolean(),
      subjectToShelfLifeExpirationDate: Joi.boolean(),
      subjectToBatchItem: Joi.boolean(),
      procurementTime: Joi.number().positive().allow(0),
      determineProcurementTimeAutomatically: Joi.boolean(),
      additionalHandlingTime: Joi.number().positive().allow(0)
    }),
    countryOfOrigin: Joi.string(),
    conditionId: Joi.number().positive(),
    shippingClassId: Joi.number().positive(),
    productGroupId: Joi.number().positive(),
    taxClassId: Joi.number().positive(),
    dimensions: Joi.object({
      length: Joi.number().positive().allow(0),
      width: Joi.number().positive().allow(0),
      height: Joi.number().positive().allow(0)
    }),
    weights: Joi.object({
      itemWeigth: Joi.number().positive().allow(0),
      shippingWeight: Joi.number().positive().allow(0)
    }),
    allowNegativeStock: Joi.boolean(),
    quantities: Joi.object({
      minimumOrderQuantity: Joi.number().positive().allow(0),
      minimumPurchaseQuantityForCustomerGroup: Joi.array().items(
        Joi.object({
          customerGroupId: Joi.number().positive().required(),
          permissibleOrderQuantity: Joi.number().positive().allow(0),
          minimumPurchaseQuantity: Joi.number().positive().allow(0),
          isActive: Joi.boolean()
        })
      ),
      permissibleOrderQuantity: Joi.number().positive().allow(0)
    }),
    dangerousGoods: Joi.object({
      unNumber: Joi.string(),
      hazardNo: Joi.string()
    }),
    taric: Joi.string(),
    searchTerms: Joi.string(),
    priceListActive: Joi.boolean(),
    ignoreDiscounts: Joi.boolean(),
    availabilityId: Joi.number().positive()
  }).required()
})

const validateCampaignQuota = Joi.object({
  campaignQuota: Joi.object({
    orderedQuota: Joi.number().required(),
    orderedDate: Joi.date().required(),
    orderId: Joi.string().required()
  }).required()
})

const validateCampaignQuotaNotification = Joi.object({
  campaignQuotaNotification: Joi.object({
    threshold: Joi.number().min(0).max(100).required(),
    recipients: Joi.array().items(Joi.string().email()).min(1).required(),
    frequency: Joi.number().min(1).default(1),
    frequencyUnit: Joi.string().valid('hour', 'hours', 'day', 'days', 'week', 'weeks', 'month', 'months').default('month'),
    isEnabled: Joi.boolean().default(true)
  }).required()
})

const validateApiKey = Joi.object({
  apiKey: Joi.object({
    isEnabled: Joi.boolean().default(true),
    description: Joi.string().max(255).allow(null).allow(''),
    permissions: Joi.array().items(Joi.object({
      module: Joi.string().required().valid(...appModules.MODULES_ARRAY),
      permission: Joi.string().required().valid(...[permissions.READ, permissions.READWRITE]),
      isEnabled: Joi.boolean().default(true)
    })).min(1).required(),
    validFrom: Joi.date(),
    validTo: Joi.date().allow(null).default(null),
    revokedAt: Joi.date().allow(null).default(null)
  }).required()
})

const validateCompanyShopHeader = Joi.object({
  company: Joi.object({
    shopHeader: Joi.object({
      url: Joi.string().uri().required(),
      filename: Joi.string().required()
    }).allow(null)
  }).required()
}).required()

const validateProductCustomisation = Joi.object({
  productCustomisation: Joi.object({
    customisationType: Joi.string().required().valid(...['print', 'engraving', 'branding']),
    customisationDetail: Joi.string().required(),
    price: Joi.number().min(0),
    available: Joi.boolean().optional(),
    isApproved: Joi.boolean().default(false),
    designStatus: Joi.string().required(),
    color: Joi.string().required(),
    photos: Joi.array().items(
      Joi.object({
        filename: Joi.string().required(),
        url: Joi.string().uri().required()
      }).required()
    ).required()
  }).required()
})

const validateProductCustomisationChat = Joi.object({
  productCustomisationChat: Joi.object({
    message: Joi.string().required(),
    attachment: Joi.array().items(
      Joi.object({
        filename: Joi.string().required(),
        url: Joi.string().uri().required()
      })
    ).allow(null)
  }).required()
})

const validateDocumentQueryParams = Joi.object({
  ...commonQueryParams,
  sortBy: Joi.object({
    dueDate: Joi.string().valid(...['asc', 'desc']),
    createdAt: Joi.string().valid(...['asc', 'desc']),
    deliveryDate: Joi.string().valid(...['asc', 'desc']),
    documentDate: Joi.string().valid(...['asc', 'desc'])
  })
}).required()

const validatePendingOrder = Joi.object({ ...commonPendingOrderSchema }).required()

const validateTitle = Joi.object({
  title: Joi.object({
    name: Joi.string().required().max(32)
  }).required()
}).required()

const validatePostedOrderId = Joi.object({
  postedOrderId: Joi.string().regex(/^\d+$/).required()
})

const validateCampaignAdditionalProductSetting = Joi.object({
  campaignAdditionalProductSetting: Joi.object({
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER])
      .required(),
    isSelectEnabled: Joi.boolean().default(true)
  }).required()
})

const validateProductStockNotification = Joi.object({
  productStockNotification: Joi.object({
    threshold: Joi.number().min(0).max(100),
    recipients: Joi.array().items(Joi.string().email()).min(1).required(),
    frequency: Joi.number().min(1).default(1),
    frequencyUnit: Joi.string().valid('hour', 'hours', 'day', 'days', 'week', 'weeks', 'month', 'months').default('month'),
    quantity: Joi.number().required().min(0),
    isEnabled: Joi.boolean().default(true)
  }).required()
})
const validateVerifyTokenQueryParams = Joi.object({
  token: Joi.string()
}).required()

export default {
  validateCreatedUser,
  validateLogin,
  validateUpdatedUser,
  validateRole,
  validatePassword,
  validateUUID,
  validateEmail,
  validateOtp,
  validateUserPhoto,
  validatePasswordReset,
  validateNotifications,
  validateCreatedCompany,
  validateQueryParams,
  validateUpdatedCompany,
  validateCreatedAddress,
  validateUpdatedAddress,
  validateCreatedRecipient,
  validateUpdatedRecipient,
  validateCampaign,
  validateCampaignAdmin,
  validateJoinCompany,
  validateUserCompanyRole,
  validateSalutation,
  validateCostCenter,
  validateDomain,
  validateEmailVerification,
  validateUserActivation,
  validateCreatedUserByAdmin,
  validateBundle,
  validateUserCompanyAndRole,
  validatePicture,
  validateTrackingId,
  validateProduct,
  validateProductAdmin,
  validateProductUpdate,
  validateProductCompany,
  validateOrder,
  validateSecondaryDomain,
  validateLegalText,
  validatePrivacyRule,
  validateRegistrationQueryParams,
  validateShippingMethod,
  validatePendingOrders,
  validateCardTemplate,
  validateCardSetting,
  validateGreetingCard,
  validatePostedOrders,
  validateProductId,
  validateAuthToken,
  validateCampaignOrderLimit,
  validateCampaignShippingDestination,
  validatePasswordResetAdmin,
  validateEmailTemplate,
  validateEmailTemplateType,
  validateUserCompanyInvite,
  validateCampaignAddress,
  validateMaintenanceMode,
  validateCompanyTheme,
  validateCompanySubscription,
  validateCompanyLogo,
  validateProductCategory,
  validateProductCategoryTag,
  validateProductTag,
  validateChild,
  validateChildren,
  validateProductQueryParams,
  validateGraduatedPrice,
  validateProductColor,
  validateProductMaterial,
  validateProductSize,
  validateProductAccessControlGroup,
  validateProductCategoryTagProductAccessControlGroup,
  validateUserProductAccessControlGroup,
  validateCompanyProductAccessControlGroup,
  validateCompanyUserGroup,
  validateUpdatedCompanyUserGroup,
  validateUserCompanyUserGroup,
  validateCompanyUserGroupProductAccessControlGroup,
  validateTaxRate,
  validateTaxRateUpdate,
  validateMassUnit,
  validateMassUnitUpdate,
  validateSalesUnit,
  validateSalesUnitUpdate,
  validateProductCategoryProducts,
  validateCompanyInviteToken,
  validateCompanyInviteDomainCheck,
  validateProductCategorySortOrder,
  validateInvoiceQueryParams,
  validateOrderUpdate,
  validateArticleItem,
  validateCampaignQuota,
  validateCampaignQuotaNotification,
  validateApiKey,
  validateCompanyShopHeader,
  validateProductCustomisation,
  validateDocumentQueryParams,
  validateProductCategoryForCompany,
  validateTitle,
  validatePostedOrderId,
  validateProductCategoryUpdate,
  validatePendingOrder,
  validatePendingOrderUpdate,
  validateCampaignAdditionalProductSetting,
  validateProductCustomisationChat,
  validateProductStockNotification,
  validateVerifyTokenQueryParams
}
