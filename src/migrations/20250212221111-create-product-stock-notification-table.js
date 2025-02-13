'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ProductStockNotifications', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      threshold: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      recipients: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      frequency: {
        allowNull: false,
        defaultValue: 1,
        type: Sequelize.INTEGER
      },
      frequencyUnit: {
        allowNull: false,
        defaultValue: 'month',
        type: Sequelize.STRING
      },
      quantity: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      lastSentAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      isEnabled: {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN
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
      productId: {
        allowNull: true,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'Products',
          key: 'id',
          as: 'productId'
        }
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ProductStockNotifications')
  }
}
