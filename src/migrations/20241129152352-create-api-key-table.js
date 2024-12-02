'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ApiKeys', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      secretKey: {
        allowNull: false,
        type: Sequelize.TEXT,
        unique: true
      },
      isEnabled: {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN
      },
      description: {
        allowNull: true,
        type: Sequelize.STRING
      },
      validFrom: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      validTo: {
        allowNull: true,
        type: Sequelize.DATE
      },
      revokedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      permissions: {
        allowNull: false,
        type: Sequelize.JSONB,
        defaultValue: []
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
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ApiKeys')
  }
}
