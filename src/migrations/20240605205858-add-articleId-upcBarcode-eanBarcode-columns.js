'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('CardTemplates', 'upcBarcode', {
        allowNull: true,
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('CardTemplates', 'eanBarcode', {
        allowNull: true,
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('CardTemplates', 'articleId', {
        allowNull: true,
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('CardSettings', 'upcBarcode', {
        allowNull: true,
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('CardSettings', 'eanBarcode', {
        allowNull: true,
        type: Sequelize.STRING
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('CardTemplates', 'upcBarcode'),
      queryInterface.removeColumn('CardTemplates', 'eanBarcode'),
      queryInterface.removeColumn('CardTemplates', 'articleId'),
      queryInterface.removeColumn('CardSettings', 'upcBarcode'),
      queryInterface.removeColumn('CardSettings', 'eanBarcode')
    ])
  }
}
