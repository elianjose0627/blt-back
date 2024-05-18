'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Products', 'parentId', {
        type: Sequelize.UUID,
        allowNull: true,
        onDelete: 'CASCADE',
        references: {
          model: 'Products',
          key: 'id',
          as: 'parentId'
        }
      }),
      queryInterface.addColumn('Products', 'isParent', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Products', 'parentId'),
      queryInterface.removeColumn('Products', 'isParent')
    ])
  }
}
