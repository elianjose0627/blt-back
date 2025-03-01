'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PendingOrders', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      customerId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      platform: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      language: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false
      },
      inetorderno: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      orderNo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      projectNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      shippingId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      shipped: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deliverydate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      costCenter: {
        type: Sequelize.STRING,
        allowNull: true
      },
      paymentType: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      paymentTarget: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      discount: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      orderStatus: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdBy: {
        type: Sequelize.STRING,
        allowNull: true
      },
      updatedBy: {
        type: Sequelize.STRING,
        allowNull: true
      },
      orderLineRequests: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      shippingAddressRequests: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      paymentInformationRequests: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      isPosted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created: {
        allowNull: false,
        type: Sequelize.DATE
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
      userId: {
        allowNull: true,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id',
          as: 'userId'
        }
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
    await queryInterface.dropTable('PendingOrders')
  }
}
