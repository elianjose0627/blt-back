'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('GreetingCards', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      articleNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      articleName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      totalStock: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      inventory: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      availableStock: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      jtlfpid: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('GreetingCards')
  }
}
