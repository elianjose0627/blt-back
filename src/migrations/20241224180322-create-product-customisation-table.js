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
        type: Sequelize.STRING,
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
      productId: {
        allowNull: true,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'Products',
          key: 'id',
          as: 'productId'
        }
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
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ProductCustomisations')
  }
}
