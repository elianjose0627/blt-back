'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ProductGraduatedPrices', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      firstUnit: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      lastUnit: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      price: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0.00
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
        allowNull: false,
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
    await queryInterface.dropTable('ProductGraduatedPrices')
  }
}
