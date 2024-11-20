const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

const now = dayjs.utc().format()
const createdAt = now
const updatedAt = now

module.exports = {
  up: async (queryInterface) => queryInterface.bulkInsert('AccessPermissions', [
    {
      id: '91846817-1966-430E-B21C-23445B55A9D9',
      name: 'Company Administrator Read Write Access Permission',
      module: 'accessPermissions',
      role: 'CompanyAdministrator',
      permission: 'readwrite',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    },
    {
      id: 'C2B3F553-A024-4A6E-B7FC-8E50A1EA4CC3',
      name: 'Company Administrator Read Write Access Permission',
      module: 'companies',
      role: 'CompanyAdministrator',
      permission: 'readwrite',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    },
    {
      id: '77F64E4B-FA34-4D00-A9C6-FA1DA3C30AA9',
      name: 'Company Administrator Read Write Campaigns',
      module: 'campaigns',
      role: 'CompanyAdministrator',
      permission: 'readwrite',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    },
    {
      id: '3F3C4707-9620-4744-B7A9-E9DC83DA9F3F',
      name: 'Company Administrator Read Write Recipients',
      module: 'recipients',
      role: 'CompanyAdministrator',
      permission: 'readwrite',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    },
    {
      id: 'B365B4EB-003D-4B46-A71D-94C56373DA15',
      name: 'Company Administrator Read Bundles',
      module: 'bundles',
      role: 'CompanyAdministrator',
      permission: 'read',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    },
    {
      id: '9828A22F-CF20-4B9A-B0AC-4043495B0083',
      name: 'Company Administrator Read Write Cost Centers',
      module: 'costCenters',
      role: 'CompanyAdministrator',
      permission: 'readwrite',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    },
    {
      id: '98E30DCE-1A79-4B85-AFF0-C504624492EE',
      name: 'Company Administrator Read Products',
      module: 'products',
      role: 'CompanyAdministrator',
      permission: 'read',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    },
    {
      id: '3D755290-B2F6-4800-8EAC-9E4674CFACE4',
      name: 'Company Administrator Read Write Addresses',
      module: 'addresses',
      role: 'CompanyAdministrator',
      permission: 'readwrite',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    },
    {
      id: 'D4A89053-15CF-44E9-9907-44C58D9D82EE',
      name: 'Company Administrator Read Write Orders',
      module: 'orders',
      role: 'CompanyAdministrator',
      permission: 'readwrite',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    },
    {
      id: '7D3D0355-A89C-4051-9C27-4F5677DB29DA',
      name: 'Company Administrator Read Write Subscriptions',
      module: 'companySubscriptions',
      role: 'CompanyAdministrator',
      permission: 'readwrite',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    },
    {
      id: 'D705B5FB-4247-478C-87FD-1C3011F6B09B',
      name: 'Campaign Manager Read Write Campaigns',
      module: 'campaigns',
      role: 'CampaignManager',
      permission: 'readwrite',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    },
    {
      id: 'AE9F0528-580F-44FF-BD6A-4A2856DA5B96',
      name: 'Campaign Manager Read Write Recipients',
      module: 'recipients',
      role: 'CampaignManager',
      permission: 'readwrite',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    },
    {
      id: 'CB672E52-E404-436C-90FF-2C265052622C',
      name: 'Campaign Manager Read Bundles',
      module: 'bundles',
      role: 'CampaignManager',
      permission: 'read',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    },
    {
      id: 'B21D41AD-F225-49AC-AA10-015BDECCB1EF',
      name: 'Campaign Manager Read Write Orders',
      module: 'orders',
      role: 'CampaignManager',
      permission: 'readwrite',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    },
    {
      id: '13CA0BD7-7D10-4841-A699-DFF4FC38B328',
      name: 'Campaign Manager Read Products',
      module: 'products',
      role: 'CampaignManager',
      permission: 'read',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    },
    {
      id: '03BC5033-37B9-4965-B7D9-C212754DCA17',
      name: 'Company Administrator Read Write Order Additional Products',
      module: 'orderAdditionalProducts',
      role: 'CompanyAdministrator',
      permission: 'readwrite',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    },
    {
      id: 'DFBF27D5-A95F-43B1-BE9C-0DD1783853A6',
      name: 'Campaign Manager No Access Order Additional Products',
      module: 'orderAdditionalProducts',
      role: 'CampaignManager',
      permission: 'noaccess',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    },
    {
      id: '6AE0312E-C7B2-4D46-965F-7599916CF5B5',
      name: 'Employee No Access Order Additional Products',
      module: 'orderAdditionalProducts',
      role: 'Employee',
      permission: 'noaccess',
      isEnabled: 'TRUE',
      createdAt,
      updatedAt,
      deletedAt: null,
      companyId: null
    }
  ], {}),
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('AccessPermissions', { companyId: null })
  }
}
