import * as statusCodes from '../constants/statusCodes'
import type { CustomNext, CustomRequest, CustomResponse, Module } from '../types'
import { io } from '../utils/socket'
import db from '../models'

class BaseController {
  service: any

  constructor (service: any) {
    this.service = service
    this.setModule = this.setModule.bind(this)
    this.checkRecord = this.checkRecord.bind(this)
    this.getAll = this.getAll.bind(this)
    this.get = this.get.bind(this)
    this.insert = this.insert.bind(this)
    this.update = this.update.bind(this)
    this.delete = this.delete.bind(this)
    this.purge = this.purge.bind(this)
  }

  recordName (): any {
    return this.service.singleRecord()
  }

  moduleName (): Module {
    return this.service.manyRecords()
  }

  async setModule (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> {
    const permissions = await db.AccessPermission.findAll({
      attributes: {
        exclude: ['deletedAt', 'companyId']
      },
      where: {
        companyId: null,
        isEnabled: true
      }
    })

    req.accessPermissions = permissions

    req.module = this.moduleName()

    return next()
  }

  async checkRecord (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> {
    const { id } = req.params
    const record = await this.service.findById(id)

    if (record === null) {
      return res.status(statusCodes.NOT_FOUND).send({
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: `${String(this.service.model)} not found`
        }
      })
    }
    req.record = record
    return next()
  }

  async getAll (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { limit, page, offset, search, filter } = req.query
    const records = await this.service.getAll(limit, offset, search, filter)
    const meta = {
      total: records.count,
      pageCount: Math.ceil(records.count / limit),
      perPage: limit,
      page
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      meta,
      [this.service.manyRecords()]: records.rows
    })
  }

  async get (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { id } = req.params
    const record = await this.service.get(id)

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      [this.recordName()]: record
    })
  }

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const record = await this.service.insert(req.body[this.recordName()])

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    return res.status(statusCodes.CREATED).send({
      statusCode: statusCodes.CREATED,
      success: true,
      [this.service.singleRecord()]: record
    })
  }

  async update (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record, body } = req

    const response = await this.service.update(record, body[this.recordName()])

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} updated` })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      [this.service.singleRecord()]: response
    })
  }

  async delete (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record } = req

    const response = await this.service.delete(record)

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} deleted` })

    return res.status(statusCodes.NO_CONTENT).send(response)
  }

  async purge (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record } = req

    const response = await this.service.purge(record)

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} purged` })

    return res.status(statusCodes.NO_CONTENT).send(response)
  }
}

export default BaseController
