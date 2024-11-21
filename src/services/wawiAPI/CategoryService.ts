import BaseService from '../BaseService'
import axios from 'axios'

const baseURL = process.env.WAWI_API_URL as string
const wawiAppId = process.env.WAWI_API_APP_ID as string
const wawiAppVersion = process.env.WAWI_API_APP_VERSION as string
const wawiApiKey = process.env.WAWI_API_KEY as string

const apiClient: any = axios.create({
  baseURL: `${baseURL}/api/eazybusiness/v1`,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-AppId': wawiAppId,
    'X-AppVersion': wawiAppVersion
  },
  timeout: 60000
})

class CategoryService extends BaseService {
  async getCategories (page: number, limit: number): Promise<any> {
    apiClient.defaults.headers.common.Authorization = `${wawiApiKey}`
    const config = {
      params: {
        pageNumber: page,
        pageSize: limit
      }
    }

    const { data } = await apiClient.get('/categories', config)

    return data
  }
}

export default CategoryService
