import { Joi } from 'celebrate'

import * as countryList from '../utils/countries'
import * as userRoles from '../utils/userRoles'
import * as currencies from '../utils/currencies'

const imageMimeTypes = ['image/bmp', 'image/jpeg', 'image/x-png', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

const validateCreatedUser = Joi.object({
  user: Joi.object({
    firstName: Joi.string().required().max(64),
    lastName: Joi.string().required().max(64),
    username: Joi.string().lowercase().optional().allow(null).max(64).regex(/^\S+$/)
      .messages({
        'string.pattern.base': '{#label} cannot contain spaces'
      }),
    email: Joi.string().email().lowercase().required().max(128),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    password: Joi.string().min(6).max(64).required()
  }).required()
})

const validateCreatedUserByAdmin = Joi.object({
  user: Joi.object({
    firstName: Joi.string().required().max(64),
    lastName: Joi.string().required().max(64),
    username: Joi.string().lowercase().optional().allow(null).max(64).regex(/^\S+$/)
      .messages({
        'string.pattern.base': '{#label} cannot contain spaces'
      }),
    email: Joi.string().email().lowercase().required().max(128),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    password: Joi.string().min(6).max(64).required(),
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.ADMIN, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER])
      .required(),
    isActive: Joi.boolean().default(true),
    isGhost: Joi.boolean().default(false),
    companyId: Joi.string().uuid().allow(null).default(null)
  }).required()
})

const validateLogin = Joi.object({
  user: Joi.object({
    email: Joi.string().lowercase().email().required(),
    password: Joi.string().required()
  }).required()
})

const validateUpdatedUser = Joi.object({
  user: Joi.object({
    salutation: Joi.string().optional().allow('').allow(null).max(8),
    firstName: Joi.string().optional().max(64),
    lastName: Joi.string().optional().max(64),
    username: Joi.string().lowercase().optional().allow(null).max(64).regex(/^\S+$/)
      .messages({
        'string.pattern.base': '{#label} cannot contain spaces'
      }),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    location: Joi.object({
      country: Joi.string().required().valid(...countryList.countries).allow('').allow(null)
    }).optional()
  }).required()
})

const validateRole = Joi.object({
  user: Joi.object({
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.ADMIN, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER])
      .required()
  }).required()
})

const validateEmailVerification = Joi.object({
  user: Joi.object({
    isVerified: Joi.bool()
      .required()
  }).required()
})

const validateUserActivation = Joi.object({
  user: Joi.object({
    isActive: Joi.bool()
      .required()
  }).required()
})

const validateUserCompanyRole = Joi.object({
  user: Joi.object({
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER])
      .required()
  }).required()
})

const validateUserCompany = Joi.object({
  user: Joi.object({
    companyId: Joi.string().uuid().required()
  }).required()
})

const validatePassword = Joi.object({
  user: Joi.object({
    currentPassword: Joi.string().required(),
    password: Joi.string().min(6).max(64).required()
  }).required()
})

const validatePasswordReset = Joi.object({
  user: Joi.object({
    password: Joi.string().min(6).max(64).required()
  }).required()
})

const validateUserPhoto = Joi.object({
  user: Joi.object({
    photo: Joi.object({
      url: Joi.string().uri().required(),
      filename: Joi.string().required()
    }).required()
  }).required()
})

const validateEmail = Joi.object({
  user: Joi.object({
    email: Joi.string().email().lowercase().required()
  }).required()
})

const validateOtp = Joi.object({
  user: Joi.object({
    email: Joi.string().email().lowercase().required(),
    otp: Joi.number().required()
  }).required()
})

const validateUUID = Joi.object().keys({
  id: Joi.string().uuid(),
  userId: Joi.string().uuid()
})

const validateTrackingId = Joi.object().keys({
  trackingId: Joi.string()
})

const validateUsersQueryParams = Joi.object({
  limit: Joi.number().optional(),
  page: Joi.number().optional(),
  offset: Joi.number().optional(),
  email: Joi.string().optional().email().lowercase().max(128)
})

const validateQueryParams = Joi.object({
  limit: Joi.number().optional(),
  page: Joi.number().optional(),
  offset: Joi.number().optional(),
  search: Joi.any().optional(),
  filter: Joi.object({
    firstname: Joi.string().optional(),
    lastname: Joi.string().optional(),
    email: Joi.string().email().optional(),
    city: Joi.string().optional(),
    country: Joi.string().length(2).optional(),
    company: Joi.string().optional(),
    type: Joi.string().optional()
  }).optional()
})

const validateNotifications = Joi.object({
  user: Joi.object({
    notifications: Joi.object({
      isEnabled: Joi.boolean().optional()
    })
  })
})

const validateCreatedCompany = Joi.object({
  company: Joi.object({
    name: Joi.string().required().max(64),
    suffix: Joi.string().max(32).allow('').allow(null),
    email: Joi.string().email().lowercase().required().max(128),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    vat: Joi.string().optional().max(24).allow('').allow(null),
    domain: Joi.string().domain().allow('').allow(null),
    customerId: Joi.number().optional().allow('').allow(null)
  }).required()
})

const validateUpdatedCompany = Joi.object({
  company: Joi.object({
    name: Joi.string().optional().max(64),
    suffix: Joi.string().max(32).allow('').allow(null),
    email: Joi.string().email().lowercase().optional().max(128),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    vat: Joi.string().optional().max(24).allow('').allow(null),
    domain: Joi.string().domain().allow('').allow(null),
    customerId: Joi.number().optional().allow('').allow(null)
  }).required()
})

const validateDomain = Joi.object({
  company: Joi.object({
    isDomainVerified: Joi.boolean().required()
  }).required()
})

const validateCreatedAddress = Joi.object({
  address: Joi.object({
    country: Joi.string().required().valid(...countryList.countries).max(64),
    city: Joi.string().required().max(64),
    street: Joi.string().optional().allow('').allow(null).max(64),
    zip: Joi.string().optional().max(24),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    addressAddition: Joi.string().allow('').allow(null).max(256),
    vat: Joi.string().allow('').allow(null).max(24)
  }).required()
})

const validateUpdatedAddress = Joi.object({
  address: Joi.object({
    country: Joi.string().optional().valid(...countryList.countries).max(64),
    city: Joi.string().optional().max(64),
    street: Joi.string().optional().allow('').allow(null).max(64),
    zip: Joi.string().optional().max(24),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    addressAddition: Joi.string().allow('').allow(null).max(256),
    vat: Joi.string().allow('').allow(null).max(24)
  }).required()
})

const validateCreatedRecipient = Joi.object({
  recipient: Joi.object({
    companyName: Joi.string().optional().allow('').allow(null).max(64),
    salutation: Joi.string().optional().allow('').allow(null).max(8),
    firstName: Joi.string().optional().allow('').allow(null).max(64),
    lastName: Joi.string().optional().allow('').allow(null).max(64),
    email: Joi.string().email().lowercase().optional().allow('').allow(null).max(128),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    country: Joi.string().required().valid(...countryList.countries).max(64),
    city: Joi.string().required().max(64),
    street: Joi.string().optional().allow('').allow(null).max(64),
    zip: Joi.string().optional().max(24),
    addressAddition: Joi.string().allow('').allow(null).max(256)
  }).required()
})

const validateUpdatedRecipient = Joi.object({
  recipient: Joi.object({
    companyName: Joi.string().optional().allow('').allow(null).max(64),
    salutation: Joi.string().optional().allow('').allow(null).max(8),
    firstName: Joi.string().optional().allow('').allow(null).max(64),
    lastName: Joi.string().optional().allow('').allow(null).max(64),
    email: Joi.string().email().lowercase().optional().allow('').allow(null).max(128),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    country: Joi.string().optional().valid(...countryList.countries).max(64),
    city: Joi.string().optional().max(64),
    street: Joi.string().optional().allow('').allow(null).max(64),
    zip: Joi.string().optional().max(24),
    addressAddition: Joi.string().allow('').allow(null).max(256)
  }).required()
})

const validateCampaign = Joi.object({
  campaign: Joi.object({
    name: Joi.string().required().allow('').allow(null).max(64),
    status: Joi.string().required().valid(...['draft', 'submitted']),
    type: Joi.string().required().valid(...['onboarding', 'birthday', 'christmas']),
    description: Joi.string().allow(null).allow('').max(1024)
  }).required()
})

const validateJoinCompany = Joi.object({
  user: Joi.object({
    email: Joi.string().email().lowercase().required().max(128),
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER]),
    actionType: Joi.string().valid(...['remove', 'add']).default('add')
  }).required()
})

const validateSalutation = Joi.object({
  salutation: Joi.object({
    title: Joi.string().required().max(8)
  }).required()
})

const validatePrivacyRule = Joi.object({
  privacyRule: Joi.object({
    module: Joi.string().required().max(16),
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.ADMIN, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER])
      .required(),
    isEnabled: Joi.boolean()
  }).required()
})

const validateSecondaryDomain = Joi.object({
  secondaryDomain: Joi.object({
    name: Joi.string().domain()
  }).required()
})

const validateCostCenter = Joi.object({
  costCenter: Joi.object({
    center: Joi.number().required()
  }).required()
})

const validateBundle = Joi.object({
  bundle: Joi.object({
    jfsku: Joi.string().allow('').allow(null).max(20),
    merchantSku: Joi.string().allow('').allow(null).max(40),
    name: Joi.string().required().max(128),
    description: Joi.string().allow(null).allow('').max(1024),
    price: Joi.number().max(1000000).min(0),
    isLocked: Joi.boolean(),
    isBillOfMaterials: Joi.boolean(),
    specifications: Joi.object({
      isBatch: Joi.boolean().default(false),
      isDivisible: Joi.boolean().default(false),
      isBestBefore: Joi.boolean().default(false),
      isSerialNumber: Joi.boolean().default(false),
      isBillOfMaterials: Joi.boolean().default(false),
      billOfMaterialsComponents: Joi.array().items(
        Joi.object({
          name: Joi.string().required().max(128),
          jfsku: Joi.string().required().max(20),
          merchantSku: Joi.string().required().max(40),
          quantity: Joi.number().default(1)
        })
      ).min(1).required()
    }).default(null)
  }).required()
})

const validatePicture = Joi.object({
  picture: Joi.object({
    url: Joi.string().uri().required(),
    filename: Joi.string().required(),
    size: Joi.number(),
    mimeType: Joi.string().valid(...imageMimeTypes).allow(null).allow('')
  }).required()
})

const validateProduct = Joi.object({
  product: Joi.object({
    name: Joi.string().required().max(64),
    jfsku: Joi.string().required().max(64),
    merchantSku: Joi.string().required().max(64),
    productGroup: Joi.string().required().max(64),
    type: Joi.string().required().valid(...['generic', 'custom']),
    netRetailPrice: Joi.object({
      amount: Joi.number(),
      currency: Joi.string().required().valid(...currencies.currencies),
      discount: Joi.number()
    })
  }).required()
})

const validateProductAdmin = Joi.object({
  product: Joi.object({
    companyId: Joi.string().uuid().allow(null).default(null),
    name: Joi.string().required().max(64),
    jfsku: Joi.string().required().max(64),
    merchantSku: Joi.string().required().max(64),
    productGroup: Joi.string().required().max(64),
    type: Joi.string().required().valid(...['generic', 'custom']),
    netRetailPrice: Joi.object({
      amount: Joi.number(),
      currency: Joi.string().required().valid(...currencies.currencies),
      discount: Joi.number()
    })
  }).required()
})

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
        quantity: Joi.number(),
        itemType: Joi.string().required().valid(...['BillOfMaterials', 'Product']),
        quantityOpen: Joi.number(),
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
      phone: Joi.string().required()
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
    attachments: Joi.any()
  })
})

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
})

const validateRegistrationQueryParams = Joi.object({
  companyId: Joi.string().length(96)
})

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
  validateUsersQueryParams,
  validateNotifications,
  validateCreatedCompany,
  validateQueryParams,
  validateUpdatedCompany,
  validateCreatedAddress,
  validateUpdatedAddress,
  validateCreatedRecipient,
  validateUpdatedRecipient,
  validateCampaign,
  validateJoinCompany,
  validateUserCompanyRole,
  validateSalutation,
  validateCostCenter,
  validateDomain,
  validateEmailVerification,
  validateUserActivation,
  validateCreatedUserByAdmin,
  validateBundle,
  validateUserCompany,
  validatePicture,
  validateTrackingId,
  validateProduct,
  validateProductAdmin,
  validateOrder,
  validateSecondaryDomain,
  validateLegalText,
  validatePrivacyRule,
  validateRegistrationQueryParams
}
