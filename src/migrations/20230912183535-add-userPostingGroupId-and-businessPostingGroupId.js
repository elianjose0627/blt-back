'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Users', 'userPostingGroupId', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('Companies', 'businessPostingGroupId', {
        type: Sequelize.STRING,
        allowNull: true
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Users', 'userPostingGroupId'),
      queryInterface.removeColumn('Companies', 'businessPostingGroupId')
    ])
  }
}
