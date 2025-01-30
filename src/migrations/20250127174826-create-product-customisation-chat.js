'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ProductCustomisationChats', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false
      },
      attachment: {
        type: Sequelize.JSONB,
        allowNull: false
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
      productCustomisationId: {
        allowNull: true,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'ProductCustomisations',
          key: 'id',
          as: 'productCustomisationId'
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
    await queryInterface.dropTable('ProductCustomisationChats')
  }
}
