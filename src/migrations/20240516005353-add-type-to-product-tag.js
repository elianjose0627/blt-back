'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('ProductCategoryTags', 'type', {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: 'category'
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('ProductCategoryTags', 'type')
    ])
  }
}
