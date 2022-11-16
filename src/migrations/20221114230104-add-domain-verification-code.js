module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Companies', 'domainVerificationCode', {
      type: Sequelize.JSON,
      defaultValue: {
        createdAt: null,
        value: null
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Companies', 'domainVerificationCode')
  }
}
