'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PackingSlips', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      postedOrderId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      packingSlipNumber: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        autoIncrement: true
      },
      trackingId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      costCenter: {
        type: Sequelize.STRING,
        allowNull: true
      },
      externalOrderNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      externalProjectNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date()
      },
      deliveryDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date()
      },
      documentDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date()
      },
      isEmailSent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      orderLineRequests: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      shippingAddressRequests: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      billingAddressRequests: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      companyId: {
        allowNull: true,
        type: Sequelize.UUID,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      campaignId: {
        allowNull: true,
        type: Sequelize.UUID,
        references: {
          model: 'Campaigns',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      userId: {
        allowNull: true,
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PackingSlips')
  }
}
