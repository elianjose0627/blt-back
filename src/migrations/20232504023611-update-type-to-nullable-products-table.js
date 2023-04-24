module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('Products', 'type', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.changeColumn('Products', 'productGroup', {
        type: Sequelize.STRING,
        allowNull: true
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('Products', 'type', {
        type: Sequelize.STRING,
        allowNull: false
      }),
      queryInterface.changeColumn('Products', 'productGroup', {
        type: Sequelize.STRING,
        allowNull: false
      })
    ])
  }
}
