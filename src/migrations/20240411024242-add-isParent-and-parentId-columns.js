'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Products', 'parentId', {
        type: Sequelize.UUID,
        allowNull: true
      }),
      queryInterface.addColumn('Products', 'isParent', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }),
      queryInterface.addColumn('Products', 'properties', {
        type: Sequelize.JSON,
        defaultValue: {
          color: null,
          material: null,
          size: null
        }
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Products', 'parentId'),
      queryInterface.removeColumn('Products', 'isParent'),
      queryInterface.removeColumn('Products', 'properties')
    ])
  }
}
