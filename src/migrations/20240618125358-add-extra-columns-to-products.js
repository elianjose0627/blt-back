'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Products', 'recommendedNetSalePrice', {
        allowNull: false,
        defaultValue: 0.00,
        type: Sequelize.DOUBLE
      }),
      queryInterface.addColumn('Products', 'shippingWeight', {
        allowNull: false,
        defaultValue: 0.00,
        type: Sequelize.DOUBLE
      }),
      queryInterface.addColumn('Products', 'weight', {
        allowNull: false,
        defaultValue: 0.00,
        type: Sequelize.DOUBLE
      }),
      queryInterface.addColumn('Products', 'barcode', {
        allowNull: true,
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('Products', 'upc', {
        allowNull: true,
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('Products', 'taric', {
        allowNull: true,
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('Products', 'originCountry', {
        allowNull: true,
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('Products', 'bestBeforeDate', {
        defaultValue: false,
        type: Sequelize.BOOLEAN
      }),
      queryInterface.addColumn('Products', 'serialNumberTracking', {
        defaultValue: false,
        type: Sequelize.BOOLEAN
      }),
      queryInterface.addColumn('Products', 'width', {
        allowNull: false,
        defaultValue: 0.00,
        type: Sequelize.DOUBLE
      }),
      queryInterface.addColumn('Products', 'height', {
        allowNull: false,
        defaultValue: 0.00,
        type: Sequelize.DOUBLE
      }),
      queryInterface.addColumn('Products', 'length', {
        allowNull: false,
        defaultValue: 0.00,
        type: Sequelize.DOUBLE
      }),
      queryInterface.addColumn('Products', 'taxRateId', {
        allowNull: true,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'TaxRates',
          key: 'id'
        }
      }),
      queryInterface.addColumn('Products', 'salesUnitId', {
        allowNull: true,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'SalesUnits',
          key: 'id'
        }
      }),
      queryInterface.addColumn('Products', 'massUnitId', {
        allowNull: true,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'MassUnits',
          key: 'id'
        }
      }),
      queryInterface.addColumn('Products', 'productDetailId', {
        allowNull: true,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'ProductDetails',
          key: 'id'
        }
      }),
      queryInterface.addColumn('Products', 'isMetadataSynced', {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      }),
      queryInterface.addColumn('Products', 'isExceedStockEnabled', {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Products', 'recommendedNetSalePrice'),
      queryInterface.removeColumn('Products', 'shippingWeight'),
      queryInterface.removeColumn('Products', 'weight'),
      queryInterface.removeColumn('Products', 'upc'),
      queryInterface.removeColumn('Products', 'barcode'),
      queryInterface.removeColumn('Products', 'taric'),
      queryInterface.removeColumn('Products', 'originCountry'),
      queryInterface.removeColumn('Products', 'bestBeforeDate'),
      queryInterface.removeColumn('Products', 'serialNumberTracking'),
      queryInterface.removeColumn('Products', 'width'),
      queryInterface.removeColumn('Products', 'height'),
      queryInterface.removeColumn('Products', 'length'),
      queryInterface.removeColumn('Products', 'taxRateId'),
      queryInterface.removeColumn('Products', 'salesUnitId'),
      queryInterface.removeColumn('Products', 'massUnitId'),
      queryInterface.removeColumn('Products', 'productDetailId'),
      queryInterface.removeColumn('Products', 'isMetadataSynced'),
      queryInterface.removeColumn('Products', 'isExceedStockEnabled')
    ])
  }
}
