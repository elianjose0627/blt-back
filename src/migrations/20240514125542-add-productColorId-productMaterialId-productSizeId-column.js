'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Products', 'productColorId', {
        allowNull: true,
        type: Sequelize.UUID,
        references: {
          model: 'ProductColors',
          key: 'id',
          as: 'productColorId'
        }
      }),
      queryInterface.addColumn('Products', 'productMaterialId', {
        allowNull: true,
        type: Sequelize.UUID,
        references: {
          model: 'ProductMaterials',
          key: 'id',
          as: 'productMaterialId'
        }
      }),
      queryInterface.addColumn('Products', 'productSizeId', {
        allowNull: true,
        type: Sequelize.UUID,
        references: {
          model: 'ProductSizes',
          key: 'id',
          as: 'productSizeId'
        }
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Products', 'productColorId'),
      queryInterface.removeColumn('Products', 'productMaterialId'),
      queryInterface.removeColumn('Products', 'productSizeId')
    ])
  }
}
