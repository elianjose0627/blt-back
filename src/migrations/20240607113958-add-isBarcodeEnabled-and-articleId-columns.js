'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('CardTemplates', 'isBarcodeEnabled', {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }),
      queryInterface.addColumn('CardSettings', 'isBarcodeEnabled', {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }),
      queryInterface.addColumn('CardTemplates', 'articleId', {
        allowNull: true,
        type: Sequelize.STRING
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('CardTemplates', 'isBarcodeEnabled'),
      queryInterface.removeColumn('CardSettings', 'isBarcodeEnabled'),
      queryInterface.removeColumn('CardTemplates', 'articleId')
    ])
  }
}
