'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ProductCustomisations', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      customisationType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customisationDetail: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      photo: {
        type: Sequelize.JSONB,
        allowNull: false
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
    await queryInterface.dropTable('ProductCustomisations')
  }
}
