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
        allowNull: false
      },
      commodityCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      numberOfPrintPositions: {
        type: Sequelize.STRING,
        allowNull: false
      },
      countryOfOrigin: {
        type: Sequelize.STRING,
        allowNull: false
      },
      brand: {
        type: Sequelize.STRING,
        allowNull: false
      },
      productName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      categoryCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      productClass: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dimensions: {
        type: Sequelize.STRING,
        allowNull: false
      },
      length: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      lengthUnit: {
        type: Sequelize.STRING,
        allowNull: false
      },
      width: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      widthUnit: {
        type: Sequelize.STRING,
        allowNull: false
      },
      height: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      heightUnit: {
        type: Sequelize.STRING,
        allowNull: false
      },
      volume: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      volumeUnit: {
        type: Sequelize.STRING,
        allowNull: false
      },
      grossWeight: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      grossWeightUnit: {
        type: Sequelize.STRING,
        allowNull: false
      },
      netWeight: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      netWeightUnit: {
        type: Sequelize.STRING,
        allowNull: false
      },
      innerCartonQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      outerCartonQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      cartonLength: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      cartonLengthUnit: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cartonWidth: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      cartonWidthUnit: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cartonHeight: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      cartonHeightUnit: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cartonVolume: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      cartonVolumeUnit: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cartonGrossWeight: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      cartonGrossWeightUnit: {
        type: Sequelize.STRING,
        allowNull: false
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false
      },
      shortDescription: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      longDescription: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      material: {
        type: Sequelize.STRING,
        allowNull: false
      },
      printable: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: Sequelize.literal('CURRENT_TIMESTAMP')
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
