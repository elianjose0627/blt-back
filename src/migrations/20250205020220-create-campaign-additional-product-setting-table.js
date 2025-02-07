'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CampaignAdditionalProductSettings', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isSelectEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      campaignId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Campaigns',
          key: 'id',
          as: 'campaignId'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CampaignAdditionalProductSettings')
  }
}
