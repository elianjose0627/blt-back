module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('Orders', 'items', {
        type: Sequelize.JSONB,
        allowNull: true
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('Orders', 'items', {
        type: Sequelize.JSON,
        allowNull: true
      })
    ])
  }
}
