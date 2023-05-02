module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Products', 'pictures', {
      type: Sequelize.JSON,
      defaultValue: []
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Products', 'pictures')
  }
}
