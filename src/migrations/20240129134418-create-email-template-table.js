'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('EmailTemplates', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      subject: {
        allowNull: false,
        type: Sequelize.STRING
      },
      template: {
        allowNull: false,
        type: Sequelize.TEXT
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
      emailTemplateTypeId: {
        allowNull: false,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'EmailTemplateTypes',
          key: 'id',
          as: 'emailTemplateTypeId'
        }
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('EmailTemplates')
  }
}
