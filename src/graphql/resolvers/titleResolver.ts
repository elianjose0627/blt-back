import TitleDataSource from '../datasources/TitleDataSource'
import * as statusCodes from '../../constants/statusCodes'

const defaultLimit = 20
const defaultPage = 1

const titleDataSource = new TitleDataSource()

const titleResolver = {
  Query: {
    titles: async (_: any, { limit = defaultLimit, page = defaultPage }: { limit: number, page: number }) => {
      const response = await titleDataSource.getAll(limit, page)
      return {
        statusCode: statusCodes.OK,
        success: true,
        meta: {
          total: response.count,
          pageCount: Math.ceil(response.count / limit),
          perPage: limit,
          page
        },
        titles: response.rows
      }
    },
    title: async (_: any, { id }: { id: number }) => {
      const response = await titleDataSource.getById(id)
      return {
        statusCode: response === null ? statusCodes.NOT_FOUND : statusCodes.OK,
        success: response !== null,
        title: response
      }
    }
  }
}

export default titleResolver
