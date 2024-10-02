'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Invoices', {
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
      invoiceNumber: {
        type: Sequelize.STRING,
        unique: true,
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
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'open'
      },
      isEmailSent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      deliveryDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      documentDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
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
    await queryInterface.dropTable('Invoices')
  }
}
