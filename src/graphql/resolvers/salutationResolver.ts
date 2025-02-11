import SalutationDataSource from '../datasources/SalutationDataSource'
import * as statusCodes from '../../constants/statusCodes'

const defaultLimit = 20
const defaultPage = 1

const salutationDataSource = new SalutationDataSource()

const salutationResolver = {
  Query: {
    salutations: async (_: any, { limit = defaultLimit, page = defaultPage }: { limit: number, page: number }) => {
      const response = await salutationDataSource.getAll(limit, page)

      return {
        statusCode: statusCodes.OK,
        success: true,
        meta: {
          total: response.count,
          pageCount: Math.ceil(response.count / limit),
          perPage: limit,
          page
        },
        salutations: response.rows
      }
    },
    salutation: async (_: any, { id }: { id: number }) => {
      const response = await salutationDataSource.getById(id)
      return {
        statusCode: response === null ? statusCodes.NOT_FOUND : statusCodes.OK,
        success: response !== null,
        salutation: response
      }
    }
  }
}

export default salutationResolver
