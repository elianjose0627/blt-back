'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CardSettings', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      isEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isFrontSelectable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isRotationEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isBackEditable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isAutoProcessingEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      defaultBack: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      defaultFront: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      exportOrientation: {
        type: Sequelize.STRING,
        allowNull: true
      },
      exportSides: {
        type: Sequelize.STRING,
        allowNull: true
      },
      supplierEmail: {
        type: Sequelize.STRING,
        allowNull: true
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
      campaignId: {
        allowNull: false,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'Campaigns',
          key: 'id',
          as: 'campaignId'
        }
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CardSettings')
  }
}
