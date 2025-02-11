'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('ProductCustomisations', 'isApproved', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }),
      queryInterface.addColumn('ProductCustomisations', 'designStatus', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('ProductCustomisations', 'color', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('ProductCustomisations', 'companyId', {
        allowNull: true,
        type: Sequelize.UUID,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onDelete: 'CASCADE'
      }),
      queryInterface.renameColumn('ProductCustomisations', 'photo', 'photos')
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('ProductCustomisations', 'isApproved'),
      queryInterface.removeColumn('ProductCustomisations', 'designStatus'),
      queryInterface.removeColumn('ProductCustomisations', 'color'),
      queryInterface.removeColumn('ProductCustomisations', 'companyId'),
      queryInterface.renameColumn('ProductCustomisations', 'photos', 'photo')

    ])
  }
}
