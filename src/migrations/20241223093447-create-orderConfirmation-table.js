'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('OrderConfirmations', {
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
      orderConfirmationNumber: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        autoIncrement: true
      },
      externalOrderNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      externalProjectNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      taxRate: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      discountRate: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      totalVat: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      totalNet: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      totalGross: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      totalDiscount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      totalShipping: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      amountPaid: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'EUR'
      },
      isEmailSent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
      costCenter: {
        type: Sequelize.STRING,
        allowNull: true
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
        allowNull: false,
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
    await queryInterface.dropTable('OrderConfirmations')
  }
}
