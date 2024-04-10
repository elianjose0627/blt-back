'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Campaigns', 'shippingMethodType', {
        type: Sequelize.INTEGER,
        allowNull: true
      }),
      queryInterface.addColumn('Campaigns', 'shippingMethodIsDropShipping', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Campaigns', 'shippingMethodType'),
      queryInterface.removeColumn('Campaigns', 'shippingMethodIsDropShipping')
    ])
  }
}
