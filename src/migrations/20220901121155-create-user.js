module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      salutation: {
        type: Sequelize.STRING
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      username: {
        allowNull: true,
        type: Sequelize.STRING,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        unique: true
      },
      phone: {
        allowNull: true,
        type: Sequelize.STRING
      },
      location: {
        type: Sequelize.JSON,
        allowNull: true
      },
      photo: {
        allowNull: true,
        type: Sequelize.JSON
      },
      role: {
        type: Sequelize.STRING,
        defaultValue: 'User'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      otp: {
        type: Sequelize.JSON,
        defaultValue: {
          createdAt: null,
          value: null
        }
      },
      logoutTime: {
        allowNull: true,
        type: Sequelize.DATE
      },
      notifications: {
        type: Sequelize.JSON,
        defaultValue: {
          isEnabled: true
        }
      },
      loginTime: {
        type: Sequelize.JSON,
        defaultValue: {
          lastSuccessful: null,
          lastFailed: null,
          failed: 0
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      companyId: {
        allowNull: true,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'Companies',
          key: 'id',
          as: 'companyId'
        }
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users')
  }
}
