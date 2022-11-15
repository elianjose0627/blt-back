'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Addresses', 'addressAddition', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('Addresses', 'vat', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('Recipients', 'addressAddition', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }),
      queryInterface.addColumn('Recipients', 'salutation', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Addresses', 'addressAddition'),
      queryInterface.removeColumn('Addresses', 'vat'),
      queryInterface.removeColumn('Recipients', 'addressAddition'),
      queryInterface.removeColumn('Recipients', 'salutation')
    ])
  }
}
