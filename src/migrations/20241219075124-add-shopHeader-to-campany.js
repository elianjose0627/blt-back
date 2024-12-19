'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Companies', 'shopHeader', {
      type: Sequelize.JSON,
      allowNull: true,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Companies', 'shopHeader')
  }
};
