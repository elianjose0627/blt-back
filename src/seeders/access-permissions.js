const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const { v4: uuidv4 } = require('uuid')
dayjs.extend(utc)

const now = dayjs.utc().format()

const accessPermissions = [
  {
    id: uuidv4(),
    name: 'Company Administrator Read Write Access Permissions',
    module: 'accessPermissions',
    role: 'CompanyAdministrator',
    permission: 'readwrite',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(1, 'ms').toDate(),
    updatedAt: dayjs(now).add(1, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  },
  {
    id: uuidv4(),
    name: 'Company Administrator Read Write Companies',
    module: 'companies',
    role: 'CompanyAdministrator',
    permission: 'readwrite',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(2, 'ms').toDate(),
    updatedAt: dayjs(now).add(2, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  },
  {
    id: uuidv4(),
    name: 'Company Administrator Read Campaigns',
    module: 'campaigns',
    role: 'CompanyAdministrator',
    permission: 'read',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(3, 'ms').toDate(),
    updatedAt: dayjs(now).add(3, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  },
  {
    id: uuidv4(),
    name: 'Company Administrator Read Write Recipients',
    module: 'recipients',
    role: 'CompanyAdministrator',
    permission: 'readwrite',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(4, 'ms').toDate(),
    updatedAt: dayjs(now).add(4, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  },
  {
    id: uuidv4(),
    name: 'Company Administrator Read Bundles',
    module: 'bundles',
    role: 'CompanyAdministrator',
    permission: 'read',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(5, 'ms').toDate(),
    updatedAt: dayjs(now).add(5, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  },
  {
    id: uuidv4(),
    name: 'Company Administrator Read Write Cost Centers',
    module: 'costCenters',
    role: 'CompanyAdministrator',
    permission: 'readwrite',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(6, 'ms').toDate(),
    updatedAt: dayjs(now).add(6, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  },
  {
    id: uuidv4(),
    name: 'Company Administrator Read Products',
    module: 'products',
    role: 'CompanyAdministrator',
    permission: 'read',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(7, 'ms').toDate(),
    updatedAt: dayjs(now).add(7, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  },
  {
    id: uuidv4(),
    name: 'Company Administrator Read Write Addresses',
    module: 'addresses',
    role: 'CompanyAdministrator',
    permission: 'readwrite',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(8, 'ms').toDate(),
    updatedAt: dayjs(now).add(8, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  },
  {
    id: uuidv4(),
    name: 'Company Administrator Read Write Orders',
    module: 'orders',
    role: 'CompanyAdministrator',
    permission: 'readwrite',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(9, 'ms').toDate(),
    updatedAt: dayjs(now).add(9, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  },
  {
    id: uuidv4(),
    name: 'Company Administrator Read Write Company Subscriptions',
    module: 'companySubscriptions',
    role: 'CompanyAdministrator',
    permission: 'readwrite',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(10, 'ms').toDate(),
    updatedAt: dayjs(now).add(10, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  },
  {
    id: uuidv4(),
    name: 'Campaign Manager Read Campaigns',
    module: 'campaigns',
    role: 'CampaignManager',
    permission: 'read',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(11, 'ms').toDate(),
    updatedAt: dayjs(now).add(11, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  },
  {
    id: uuidv4(),
    name: 'Campaign Manager Read Write Recipients',
    module: 'recipients',
    role: 'CampaignManager',
    permission: 'readwrite',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(12, 'ms').toDate(),
    updatedAt: dayjs(now).add(12, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  },
  {
    id: uuidv4(),
    name: 'Campaign Manager Read Bundles',
    module: 'bundles',
    role: 'CampaignManager',
    permission: 'read',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(13, 'ms').toDate(),
    updatedAt: dayjs(now).add(13, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  },
  {
    id: uuidv4(),
    name: 'Campaign Manager Read Write Orders',
    module: 'orders',
    role: 'CampaignManager',
    permission: 'readwrite',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(14, 'ms').toDate(),
    updatedAt: dayjs(now).add(14, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  },
  {
    id: uuidv4(),
    name: 'Campaign Manager Read Products',
    module: 'products',
    role: 'CampaignManager',
    permission: 'read',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(15, 'ms').toDate(),
    updatedAt: dayjs(now).add(15, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  },
  {
    id: uuidv4(),
    name: 'Company Administrator Read Write Product Categories',
    module: 'productCategories',
    role: 'CompanyAdministrator',
    permission: 'readwrite',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(16, 'ms').toDate(),
    updatedAt: dayjs(now).add(16, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  },
  {
    id: uuidv4(),
    name: 'Company Administrator Read Write Product Customisations',
    module: 'productCustomisations',
    role: 'CompanyAdministrator',
    permission: 'readwrite',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(17, 'ms').toDate(),
    updatedAt: dayjs(now).add(17, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  },
  {
    id: uuidv4(),
    name: 'Company Administrator Read Write Product Stock Notifications',
    module: 'productStockNotifications',
    role: 'CompanyAdministrator',
    permission: 'readwrite',
    isEnabled: 'TRUE',
    createdAt: dayjs(now).add(18, 'ms').toDate(),
    updatedAt: dayjs(now).add(18, 'ms').toDate(),
    deletedAt: null,
    companyId: null
  }
]

module.exports = {
  up: async (queryInterface, Sequelize) => {
    for (const permission of accessPermissions) {
      const existingPermission = await queryInterface.sequelize.query(
        'SELECT id FROM "AccessPermissions" WHERE name = :name AND module = :module AND role = :role AND permission = :permission AND "companyId" IS NULL',
        {
          replacements: {
            name: permission.name,
            module: permission.module,
            role: permission.role,
            permission: permission.permission
          },
          type: Sequelize.QueryTypes.SELECT
        }
      )

      if (existingPermission.length === 0) {
        await queryInterface.bulkInsert('AccessPermissions', [permission])
      }
    }
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('AccessPermissions', { companyId: null })
  }
}
