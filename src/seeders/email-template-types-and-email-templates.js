const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const { Op } = require('sequelize')
dayjs.extend(utc)

const now = dayjs.utc().format()
const createdAt = now
const updatedAt = now
const placeholders = JSON.stringify(['[firstname]', '[lastname]', '[salutation]', '[otp]', '[url]'])

module.exports = {
  up: async (queryInterface) => {
    return await Promise.all([
      queryInterface.bulkInsert('EmailTemplateTypes', [
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
          id: 'A3D4BEEF-A40A-4E6B-98A4-6D3940101D61', // This one is missing a template
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
        },
        {
          id: '49E2A392-5C74-4EA1-9399-D3E4EF43C97B',
          name: 'Update Role',
          type: 'updateRole',
          description: 'This is used for the update role email',
          placeholders,
          createdAt,
          updatedAt,
          deletedAt: null
        }
      ], {})
    ],
    await queryInterface.bulkInsert('EmailTemplates', [
      {
        id: '13e1bccc-a661-425c-8b94-690aa8f16cda',
        subject: 'Verify your email for [app]',
        template: '<p>Hello [firstname],</p>\n<p>Thank you very much for registering an account at [app].<br></p>\n<p>To activate your account, please verify the ownership of the associated email address.</p>\n<p>Steps to verify:</p>\n<ol>\n  <li>Login to your account at [app].</li>\n  <li>Click on the profile picture at the top right corner of the screen and select "Profile".</li>\n  <li>Under the Pending Actions Section, click "Request Verification OTP" to receive your code via email.</li>\n</ol>\n<p>\n  Best Regards,<br>\n  [app] team\n</p>\n<p>For questions regarding your order, please reach out to:<br>\n  Support: [mailer] <br>\n  Sales: [salesmailer]\n</p>',
        createdAt: dayjs(now).add(1, 'M').toDate(),
        updatedAt: dayjs(now).add(1, 'M').toDate(),
        deletedAt: null,
        emailTemplateTypeId: '66DA89AC-819C-4CBB-A5A8-E70072844800',
        isDefault: true
      },
      {
        id: '35d1dea0-662e-4aa1-a06b-a3e634ed3824',
        subject: 'Verify your email for [app]',
        template: '<p>Hello [firstname],</p>\n<p>Your account has been created at [url] with a role of [role].</p>\n<p>Your temporary password is: [password].<br></p>\n<p>To activate your account, please verify the ownership of the associated email address.</p>\n<p>Steps to verify:</p>\n<ol>\n  <li>Login to your account at [app].</li>\n  <li>Click on the profile picture at the top right corner of the screen and select "Profile".</li>\n  <li>Under the Pending Actions Section, click "Request Verification OTP" to receive your code via email.</li>\n</ol>\n<p>\n  Best Regards,<br>\n  [app] team\n</p>\n<p>For questions regarding your order, please reach out to:<br>\n  Support: [mailer] <br>\n  Sales: [salesmailer]\n</p>',
        createdAt: dayjs(now).add(2, 'M').toDate(),
        updatedAt: dayjs(now).add(2, 'M').toDate(),
        deletedAt: null,
        emailTemplateTypeId: 'F52BB4AA-EE55-489F-8EAC-544D19D69C71',
        isDefault: true
      },
      {
        id: '8c47cc20-8970-43f7-bf4f-00c71bc0f24d',
        subject: 'Password Change',
        template: "<p>Hello [firstname], your password for [app] app has been updated to: </p>\n<p><span style=\"font-size:1.5em;\"><strong>[password]</strong></span></p>\n<p>If you didn't ask to change your password, contact us immediately through [adminemail]. </p>\n<p>Thanks,<br>[app] application team</p>",
        createdAt: dayjs(now).add(3, 'M').toDate(),
        updatedAt: dayjs(now).add(3, 'M').toDate(),
        deletedAt: null,
        emailTemplateTypeId: '802F46AC-A136-4A2F-85AD-EF1F9103515B',
        isDefault: true
      },
      {
        id: '90bf5a8c-56a1-48e6-a014-fb9105073132',
        subject: 'Reset password request for big little things',
        template: '<p>Hello [firstname],<br></p>\n\n<p>In order to reset your password please follow these steps:</p>\n<ol>\n  <li>Go to <a href="[url]/reset-password?token=[token]">link</a>. This link is going to be valid for [expiration].</li>\n  <li>Enter a new password for your account.</li>\n</ol>\n<p>\n  Best Regards, <br>\n  [app] team\n</p>\n<p>\n  For questions regarding your order, please reach out to: <br>\n  Support: [mailer] <br>\n  Sales: [salesmailer]\n</p>',
        createdAt: dayjs(now).add(4, 'M').toDate(),
        updatedAt: dayjs(now).add(4, 'M').toDate(),
        deletedAt: null,
        emailTemplateTypeId: '209FE2F4-3CF0-4B6D-86D6-F41934D24AD6',
        isDefault: true
      },
      {
        id: 'e7ae56ee-d3c8-4e2e-8060-97cdc954381e',
        subject: 'Verify your email for [app]',
        template: "<p>Hello [firstname],</p>\n\n<p>You have requested a verification OTP to activate your account at [app].<br>\nYour OTP is: <span style=\"font-size:1.5em;\"><strong>[otp]</strong></span></p>\n\n<p>Steps to verify:</p>\n\n<ol>\n  <li>Login to your account at [url].</li>\n  <li>Click on the profile picture at the top right corner of the screen and select \"Profile\".</li>\n  <li>Under the Pending Actions Section, Enter your verification OTP <strong>[otp]</strong> and click \"Verify Email\".</li>\n</ol>\n\n<p>If you haven't requested a verification code or created an account at big little things, notify us: [mailer].</p>\n\n<p>\n  Best Regards,<br>\n  [app] team\n</p>\n<p>\n  For questions regarding your order, please reach out to: <br>\n  Support: [mailer] <br>\n  Sales: [salesmailer]\n</p>",
        createdAt: dayjs(now).add(5, 'M').toDate(),
        updatedAt: dayjs(now).add(5, 'M').toDate(),
        deletedAt: null,
        emailTemplateTypeId: '46253AD0-2989-4104-8CBE-BBE05C1BA82C',
        isDefault: true
      },
      {
        id: '122f4c89-817b-4e14-8cd8-81cb93543c7d',
        subject: 'You have been invited by [firstname] [lastname] to create an account at [company]',
        template: '<p>Hello,</p>\n\n<p>You have been invited by [firstname] [lastname] to create an account at [url].</p>\n\n<p>Steps to register an account:</p>\n<ol>\n  <li>Register an account using your email address [useremail] at [url]</li>\n  <li>Verify your account to fully activate it.</li>\n</ol>\n\n<p>\n  Best Regards,<br>\n  [app] team\n</p>\n<p>\n  For questions regarding your order, please reach out to: <br>\n  Support: [mailer]\n</p>',
        createdAt: dayjs(now).add(6, 'M').toDate(),
        updatedAt: dayjs(now).add(6, 'M').toDate(),
        deletedAt: null,
        emailTemplateTypeId: '54A3A37A-D3CC-4A4A-8644-5290FFA10BE6',
        isDefault: true
      },
      {
        id: 'd2ba51b0-2cc5-4c96-97b8-eb0bcb1f50fe',
        subject: 'You have been granted a new user role by [firstname] [lastname] at [company]',
        template: '<p>Hello,</p>\n\n<p>You have been granted a new user role by Ryan Wire at [url].</p>\n\n<p>Please login to your account.</p>\n\n<p>\n  Best Regards, <br>\n  big little things team\n</p>\n<p>\n  For questions regarding your order, please reach out to: <br>\n  Support: [mailer]\n</p>',
        createdAt: dayjs(now).add(7, 'M').toDate(),
        updatedAt: dayjs(now).add(7, 'M').toDate(),
        deletedAt: null,
        emailTemplateTypeId: '49E2A392-5C74-4EA1-9399-D3E4EF43C97B',
        isDefault: true
      }
    ], {}))
  },
  down: async (queryInterface) => {
    return Promise.all([
      await queryInterface.bulkDelete('EmailTemplateTypes', { type: { [Op.in]: ['accountVerification', 'accountWelcome', 'passwordReset', 'forgotPassword'] } }),
      await queryInterface.bulkDelete('EmailTemplates', { isDefault: true })
    ])
  }
}
