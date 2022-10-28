import { Joi } from 'celebrate'

import * as countryList from '../utils/countries'
import * as userRoles from '../utils/userRoles'

const validateCreatedUser = Joi.object({
  user: Joi.object({
    firstName: Joi.string().required().max(64),
    lastName: Joi.string().required().max(64),
    username: Joi.string().lowercase().optional().allow(null).max(64).regex(/^\S+$/)
      .messages({
        'string.pattern.base': '{#label} cannot contain spaces'
      }),
    email: Joi.string().email().lowercase().required().max(128),
    phone: Joi.string().optional().allow('').allow(null).min(9).max(15).regex(/^[0-9]+$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    password: Joi.string().min(6).max(64).required()
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
    salutation: Joi.string().optional().max(8),
    firstName: Joi.string().optional().max(64),
    lastName: Joi.string().optional().max(64),
    username: Joi.string().lowercase().optional().allow(null).max(64).regex(/^\S+$/)
      .messages({
        'string.pattern.base': '{#label} cannot contain spaces'
      }),
    phone: Joi.string().optional().allow('').allow(null).min(9).max(15).regex(/^[0-9]+$/)
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
  id: Joi.string().uuid()
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
  offset: Joi.number().optional()
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
    email: Joi.string().email().lowercase().required().max(128),
    phone: Joi.string().optional().allow('').allow(null).min(9).max(15).regex(/^[0-9]+$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    vat: Joi.string().optional().max(24)
  }).required()
})

const validateUpdatedCompany = Joi.object({
  company: Joi.object({
    name: Joi.string().optional().max(64),
    email: Joi.string().email().lowercase().optional().max(128),
    phone: Joi.string().optional().allow('').allow(null).min(9).max(15).regex(/^[0-9]+$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    vat: Joi.string().optional().max(24)
  }).required()
})

const validateCreatedAddress = Joi.object({
  address: Joi.object({
    country: Joi.string().required().valid(...countryList.countries).max(64),
    city: Joi.string().required().max(64),
    street: Joi.string().optional().allow('').allow(null).min(9).max(64),
    zip: Joi.string().optional().max(24)
  }).required()
})

const validateUpdatedAddress = Joi.object({
  address: Joi.object({
    country: Joi.string().optional().valid(...countryList.countries).max(64),
    city: Joi.string().optional().max(64),
    street: Joi.string().optional().allow('').allow(null).min(9).max(64),
    zip: Joi.string().optional().max(24)
  }).required()
})

const validateCreatedRecipient = Joi.object({
  recipient: Joi.object({
    companyName: Joi.string().optional().allow('').allow(null).max(64),
    firstName: Joi.string().optional().allow('').allow(null).max(64),
    lastName: Joi.string().optional().allow('').allow(null).max(64),
    email: Joi.string().email().lowercase().required().max(128),
    phone: Joi.string().optional().allow('').allow(null).min(9).max(15).regex(/^[0-9]+$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    country: Joi.string().required().valid(...countryList.countries).max(64),
    city: Joi.string().required().max(64),
    street: Joi.string().optional().allow('').allow(null).min(9).max(64),
    zip: Joi.string().optional().max(24)
  }).required()
})

const validateUpdatedRecipient = Joi.object({
  recipient: Joi.object({
    companyName: Joi.string().optional().allow('').allow(null).max(64),
    firstName: Joi.string().optional().allow('').allow(null).max(64),
    lastName: Joi.string().optional().allow('').allow(null).max(64),
    email: Joi.string().email().lowercase().optional().max(128),
    phone: Joi.string().optional().allow('').allow(null).min(9).max(15).regex(/^[0-9]+$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    country: Joi.string().optional().valid(...countryList.countries).max(64),
    city: Joi.string().optional().max(64),
    street: Joi.string().optional().allow('').allow(null).min(9).max(64),
    zip: Joi.string().optional().max(24)
  }).required()
})

const validateCampaign = Joi.object({
  campaign: Joi.object({
    name: Joi.string().required().allow('').allow(null).max(64),
    status: Joi.string().required().valid(...['draft', 'submitted']),
    type: Joi.string().required().valid(...['onboarding', 'birthday', 'christmas'])
  }).required()
})

const validateJoinCompany = Joi.object({
  user: Joi.object({
    email: Joi.string().email().lowercase().required().max(128),
    actionType: Joi.string().valid(...['remove', 'add']).default('add')
  }).required()
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
  validateJoinCompany
}
