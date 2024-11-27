'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CampaignQuotaNotifications', {
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
        defaultValue: 'day',
        type: Sequelize.STRING
      },
      lastSentAt: {
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
      campaignId: {
        allowNull: true,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'Campaigns',
          key: 'id',
          as: 'campaignId'
        }
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CampaignQuotaNotifications')
  }
}
