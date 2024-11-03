'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Users', 'hireDate', {
        allowNull: true,
        type: Sequelize.DATE
      }),
      queryInterface.addColumn('Users', 'startDate', {
        allowNull: true,
        type: Sequelize.DATE
      }),
      queryInterface.addColumn('Users', 'birthDate', {
        allowNull: true,
        type: Sequelize.DATE
      }),
      queryInterface.addColumn('Users', 'releaseDate', {
        allowNull: true,
        type: Sequelize.DATE
      }),
      queryInterface.addColumn('Recipients', 'hireDate', {
        allowNull: true,
        type: Sequelize.DATE
      }),
      queryInterface.addColumn('Recipients', 'startDate', {
        allowNull: true,
        type: Sequelize.DATE
      }),
      queryInterface.addColumn('Recipients', 'birthDate', {
        allowNull: true,
        type: Sequelize.DATE
      }),
      queryInterface.addColumn('Recipients', 'releaseDate', {
        allowNull: true,
        type: Sequelize.DATE
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Users', 'hireDate'),
      queryInterface.removeColumn('Users', 'startDate'),
      queryInterface.removeColumn('Users', 'birthDate'),
      queryInterface.removeColumn('Users', 'releaseDate'),
      queryInterface.removeColumn('Recipients', 'hireDate'),
      queryInterface.removeColumn('Recipients', 'startDate'),
      queryInterface.removeColumn('Recipients', 'birthDate'),
      queryInterface.removeColumn('Recipients', 'releaseDate')
    ])
  }
}
