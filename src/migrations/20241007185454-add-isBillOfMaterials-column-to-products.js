'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Products', 'specifications', {
        allowNull: true,
        type: Sequelize.JSONB,
        defaultValue: {
          isBatch: false,
          isDivisible: false,
          isPackaging: false,
          isBestBefore: false,
          isSerialNumber: false,
          isBillOfMaterials: false,
          billOfMaterialsComponents: []
        }
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Products', 'specifications')
    ])
  }
}
