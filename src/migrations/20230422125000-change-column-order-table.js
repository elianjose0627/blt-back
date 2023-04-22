module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Orders', 'externalNote', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Orders', 'externalNote', {
      type: Sequelize.STRING,
      allowNull: false
    })
  }
}
