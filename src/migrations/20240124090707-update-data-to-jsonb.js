module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('Shipments', 'data', {
        type: Sequelize.JSONB,
        allowNull: true
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('Shipments', 'data', {
        type: Sequelize.JSON,
        allowNull: true
      })
    ])
  }
}
