module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Companies', 'suffix', {
      type: Sequelize.STRING,
      allowNull: true
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Companies', 'suffix')
  }
}
