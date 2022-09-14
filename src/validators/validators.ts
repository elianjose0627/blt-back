import { Joi } from 'celebrate'

import * as countryList from '../utils/countries'

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
    }).optional(),
    goals: Joi.object({
      daily: Joi.number().min(10).max(100).required(),
      weekly: Joi.number().min(50).max(500).required()
    }).optional()
  }).required()
})

const validateRole = Joi.object({
  user: Joi.object({
    role: Joi.string().lowercase()
      .valid(...['user', 'administrator', 'customer'])
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
    email: Joi.string().email().lowercase().max(128).required(),
    otp: Joi.number().required(),
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

const validateNotifications = Joi.object({
  user: Joi.object({
    notifications: Joi.object({
      isEnabled: Joi.boolean().optional()
    })
  })
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
  validateNotifications
}
