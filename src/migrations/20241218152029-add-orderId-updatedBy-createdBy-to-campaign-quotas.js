'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    Promise.all([
      queryInterface.addColumn('CampaignQuotas', 'orderId', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('CampaignQuotas', 'createdBy', {
        type: Sequelize.UUID,
        allowNull: true,
        onDelete: 'SET NULL',
        references: {
          model: 'Users',
          key: 'id',
          as: 'createdBy'
        }
      }),
      queryInterface.addColumn('CampaignQuotas', 'updatedBy', {
        type: Sequelize.UUID,
        allowNull: true,
        onDelete: 'SET NULL',
        references: {
          model: 'Users',
          key: 'id',
          as: 'updatedBy'
        }
      })
    ])
  },

  down: async (queryInterface, Sequelize) => {
    Promise.all([
      queryInterface.removeColumn('CampaignQuotas', 'orderId'),
      queryInterface.removeColumn('CampaignQuotas', 'createdBy'),
      queryInterface.removeColumn('CampaignQuotas', 'updatedBy')
    ])
  }
}
