'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MassUnits', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      publicId: {
        allowNull: false,
        unique: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: true,
        type: Sequelize.STRING
      },
      code: {
        allowNull: false,
        type: Sequelize.STRING
      },
      displayCode: {
        allowNull: true,
        type: Sequelize.STRING
      },
      referenceMassUnit: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      referenceMassUnitFactor: {
        allowNull: false,
        type: Sequelize.DECIMAL,
        defaultValue: 0.0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MassUnits')
  }
}
