'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Bundles', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      jfsku: {
        allowNull: true,
        type: Sequelize.STRING
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      merchantSku: {
        allowNull: true,
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      isLocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isBillOfMaterials: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
        allowNull: true,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'Campaigns',
          key: 'id',
          as: 'campaignId'
        }
      },
      shippingMethodId: {
        allowNull: true,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'ShippingMethods',
          key: 'id',
          as: 'shippingMethodId'
        }
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Bundles')
  }
}
