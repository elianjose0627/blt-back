'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Orders', 'createdByFullName', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('Orders', 'shipped', {
        type: Sequelize.DATE,
        allowNull: true
      }),
      queryInterface.addColumn('Orders', 'deliveryDate', {
        type: Sequelize.DATE,
        allowNull: true
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Orders', 'createdByFullName'),
      queryInterface.removeColumn('Orders', 'shipped'),
      queryInterface.removeColumn('Orders', 'deliveryDate')
    ])
  }
}
