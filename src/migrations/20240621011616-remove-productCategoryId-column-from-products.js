'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Products', 'productCategoryId')
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Products', 'productCategoryId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'ProductCategories',
          key: 'id'
        }
      })
    ])
  }
}
