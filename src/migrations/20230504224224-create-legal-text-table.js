'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LegalTexts', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING
      },
      template: {
        allowNull: true,
        type: Sequelize.JSON
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
      },
      companyId: {
        allowNull: true,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'Companies',
          key: 'id',
          as: 'companyId'
        }
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('LegalTexts')
  }
}
