module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Addresses', 'phone', {
      allowNull: true,
      type: Sequelize.STRING
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Addresses', 'phone')
  }
}
