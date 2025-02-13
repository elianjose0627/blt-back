'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SupplierProducts', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      masterCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      masterId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      typeOfProducts: {
        type: Sequelize.STRING,
        allowNull: true
      },
      commodityCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      numberOfPrintPositions: {
        type: Sequelize.STRING,
        allowNull: true
      },
      countryOfOrigin: {
        type: Sequelize.STRING,
        allowNull: true
      },
      brand: {
        type: Sequelize.STRING,
        allowNull: true
      },
      productName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      categoryCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      productClass: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dimensions: {
        type: Sequelize.STRING,
        allowNull: true
      },
      length: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      lengthUnit: {
        type: Sequelize.STRING,
        allowNull: true
      },
      width: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      widthUnit: {
        type: Sequelize.STRING,
        allowNull: true
      },
      height: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      heightUnit: {
        type: Sequelize.STRING,
        allowNull: true
      },
      volume: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      volumeUnit: {
        type: Sequelize.STRING,
        allowNull: true
      },
      grossWeight: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      grossWeightUnit: {
        type: Sequelize.STRING,
        allowNull: true
      },
      netWeight: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      netWeightUnit: {
        type: Sequelize.STRING,
        allowNull: true
      },
      innerCartonQuantity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      outerCartonQuantity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cartonLength: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      cartonLengthUnit: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cartonWidth: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      cartonWidthUnit: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cartonHeight: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      cartonHeightUnit: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cartonVolume: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      cartonVolumeUnit: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cartonGrossWeight: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      cartonGrossWeightUnit: {
        type: Sequelize.STRING,
        allowNull: true
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: true
      },
      shortDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      longDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      material: {
        type: Sequelize.STRING,
        allowNull: true
      },
      printable: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SupplierProducts')
  }
}
