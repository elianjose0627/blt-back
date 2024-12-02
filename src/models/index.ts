import fs from 'fs'
import path from 'path'
import { URL } from 'url'
import { DataTypes, Model, Options, Sequelize } from 'sequelize'
import dotenv from 'dotenv'
import dBConfig from '../config/config.json'
import type { Environment } from '../types'

dotenv.config()
const basename = path.basename(__filename)
const env: Environment = String(process.env.NODE_ENV) as Environment

const fileExtensions = ['.ts', '.js']

export interface Database {
  sequelize?: Sequelize
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
  SecondaryDomain?: any
  ShippingMethod?: any
  LegalText?: any
  PrivacyRule?: any
  AccessPermission?: any
  PendingOrder?: any
  CardTemplate?: any
  CardSetting?: any
  GreetingCard?: any
  CampaignOrderLimit?: any
  CampaignShippingDestination?: any
  EmailTemplate?: any
  EmailTemplateType?: any
  BlockedDomain?: any
  CampaignAddress?: any
  MaintenanceMode?: any
  CompanySubscription?: any
  ProductCategory?: any
  ProductCategoryTag?: any
  ProductTag?: any
  JtlShippingMethod?: any
  ProductGraduatedPrice?: any
  ProductColor?: any
  ProductMaterial?: any
  ProductSize?: any
  ProductAccessControlGroup?: any
  UserProductAccessControlGroup?: any
  ProductCategoryTagProductAccessControlGroup?: any
  CompanyProductAccessControlGroup?: any
  CompanyUserGroup?: any
  UserCompanyUserGroup?: any
  CompanyUserGroupProductAccessControlGroup?: any
  MassUnit?: any
  SalesUnit?: any
  TaxRate?: any
  ProductDetail?: any
  ProductProductCategory?: any
  Stock?: any
  BundleStock?: any
  CompanyInviteToken?: any
  Invoice?: any
  Country?: any
  CampaignQuota?: any
  CampaignQuotaNotification?: any
  ApiKey?: any
  [key: string]: any
}

interface CustomOptions extends Options {
  use_env_variable: string
  use_env_variable_read_replica: string
}

const db: Database = {}

const config = dBConfig[env] as CustomOptions

const writeURL = process.env[config.use_env_variable] as string
const readReplicaURL = process.env[config.use_env_variable_read_replica] as string

const parsedWriteConfig = new URL(writeURL)
const parsedReadReplicaConfig = new URL(readReplicaURL)

const replication = {
  read: [
    {
      host: parsedReadReplicaConfig.hostname,
      port: parsedReadReplicaConfig.port,
      username: parsedReadReplicaConfig.username,
      password: parsedReadReplicaConfig.password,
      database: parsedReadReplicaConfig.pathname.substring(1)
    }
  ],
  write: {
    host: parsedWriteConfig.hostname,
    port: parsedWriteConfig.port,
    username: parsedWriteConfig.username,
    password: parsedWriteConfig.password,
    database: parsedWriteConfig.pathname.substring(1)
  }
}

config.replication = replication
const sequelize = new Sequelize(writeURL, config as Options)

fs
  .readdirSync(__dirname)
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (fileExtensions.includes(file.slice(-3))))
  .forEach((file) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const model: typeof Model = require(path.join(__dirname, file))(sequelize, DataTypes)
    db[model.name] = model
  })

Object.keys(db).forEach((modelName) => {
  db[modelName].associate(db)
})

db.sequelize = sequelize
db.Sequelize = Sequelize

export const sequelizeInstance = sequelize

export default db
