module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Orders', 'outboundId', {
      allowNull: false,
      type: Sequelize.STRING,
      unique: true
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Orders', 'outboundId', {
      allowNull: false,
      type: Sequelize.STRING,
      unique: false
    })
  }
}
