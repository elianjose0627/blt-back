'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('CampaignQuotas', 'orderId', {
      type: Sequelize.STRING,
      allowNull: true,
    })

    await queryInterface.addColumn('CampaignQuotas', 'updatedBy', {
      type: Sequelize.UUID,
      allowNull: true,
    })

    await queryInterface.addColumn('CampaignQuotas', 'createdBy', {
      type: Sequelize.UUID,
      allowNull: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('CampaignQuotas', 'orderId')
    await queryInterface.removeColumn('CampaignQuotas', 'updatedBy')
    await queryInterface.removeColumn('CampaignQuotas', 'createdBy')
  }
}
