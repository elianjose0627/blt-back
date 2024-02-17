const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const { Op } = require('sequelize')
dayjs.extend(utc)

const now = dayjs.utc().format()
const createdAt = now
const updatedAt = now
const placeholders = JSON.stringify(['[firstname]', '[lastname]', '[salutation]', '[otp]', '[url]'])

module.exports = {
  up: async (queryInterface) => queryInterface.bulkInsert('EmailTemplateTypes', [
    {
      id: '46253AD0-2989-4104-8CBE-BBE05C1BA82C',
      name: 'Account Verification',
      type: 'accountVerification',
      description: 'This is used for the account verification email',
      placeholders,
      createdAt,
      updatedAt,
      deletedAt: null
    },
    {
      id: '66DA89AC-819C-4CBB-A5A8-E70072844800',
      name: 'Account Welcome',
      type: 'accountWelcome',
      description: 'This is used for the new account welcome email',
      placeholders,
      createdAt,
      updatedAt,
      deletedAt: null
    },
    {
      id: 'F52BB4AA-EE55-489F-8EAC-544D19D69C71',
      name: 'Account Welcome Admin',
      type: 'accountWelcomeAdmin',
      description: 'This is used for the new account welcome email',
      placeholders,
      createdAt,
      updatedAt,
      deletedAt: null
    },
    {
      id: '54A3A37A-D3CC-4A4A-8644-5290FFA10BE6',
      name: 'Account Invitation',
      type: 'accountInvitation',
      description: 'This is used for the account invitation email',
      placeholders,
      createdAt,
      updatedAt,
      deletedAt: null
    },
    {
      id: 'A3D4BEEF-A40A-4E6B-98A4-6D3940101D61',
      name: 'Password Reset',
      type: 'passwordReset',
      description: 'This is used for the password reset email',
      placeholders,
      createdAt,
      updatedAt,
      deletedAt: null
    },
    {
      id: '209FE2F4-3CF0-4B6D-86D6-F41934D24AD6',
      name: 'Forgot Password',
      type: 'forgotPassword',
      description: 'This is used for the forgot password email',
      placeholders,
      createdAt,
      updatedAt,
      deletedAt: null
    },
    {
      id: '802F46AC-A136-4A2F-85AD-EF1F9103515B',
      name: 'Update Password',
      type: 'updatePassword',
      description: 'This is used for the update password email',
      placeholders,
      createdAt,
      updatedAt,
      deletedAt: null
    }
  ], {}),
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('EmailTemplateTypes', { type: { [Op.in]: ['accountVerification', 'accountWelcome', 'passwordReset', 'forgotPassword'] } })
  }
}
