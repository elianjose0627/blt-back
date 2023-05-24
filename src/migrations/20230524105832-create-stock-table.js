'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Stocks', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      jfsku: {
        allowNull: false,
        type: Sequelize.STRING
      },
      stockLevel: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      stockLevelAnnounced: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      stockLevelReserved: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      stockLevelBlocked: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      fulfillerTimestamp: {
        allowNull: true,
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
    await queryInterface.dropTable('Stocks')
  }
}
