'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Pictures', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      url: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      filename: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      size: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      mimeType: {
        allowNull: true,
        type: Sequelize.STRING
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
      bundleId: {
        allowNull: false,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'Bundles',
          key: 'id',
          as: 'bundleId'
        }
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Pictures')
  }
}
