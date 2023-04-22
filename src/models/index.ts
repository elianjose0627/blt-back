import fs from 'fs'
import path from 'path'
import { DataTypes, Sequelize } from 'sequelize'
import dotenv from 'dotenv'
import dBConfig from '../config/config.json'

dotenv.config()
const basename = path.basename(__filename)
const env = String(process.env.NODE_ENV)

const fileExtensions = ['.ts', '.js']

interface Database {
  sequelize?: any
  Sequelize?: any
  User?: any
  Company?: any
  Address?: any
  Recipient?: any
  Campaign?: any
  Salutation?: any
  Token?: any
  Bundle?: any
  BundleItem?: any
  Picture?: any
  Shipment?: any
  CostCenter?: any
  Product?: any
  Order?: any
}

const db: Database = {}

const config = dBConfig[env]
const sequelize = new Sequelize(process.env[config.use_env_variable] as string, config)

fs
  .readdirSync(__dirname)
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (fileExtensions.includes(file.slice(-3))))
  .forEach((file) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const model = require(path.join(__dirname, file))(sequelize, DataTypes)
    db[model.name] = model
  })

Object.keys(db).forEach((modelName) => {
  db[modelName].associate(db)
})

db.sequelize = sequelize
db.Sequelize = Sequelize

export const sequelizeInstance = sequelize

export default db
