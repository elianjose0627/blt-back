module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Bundles', 'isLocked', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Bundles', 'isLocked')
  }
}
