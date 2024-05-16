'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CompanyProductAccessControlGroups', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      productAccessControlGroupId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'ProductAccessControlGroups',
          key: 'id'
        }
      },
      companyId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'Companies',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CompanyProductAccessControlGroups')
  }
}
