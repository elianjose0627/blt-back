module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Bundles', 'isBillOfMaterials', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Bundles', 'isBillOfMaterials')
  }
}
