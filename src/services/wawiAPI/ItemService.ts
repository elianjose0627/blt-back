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
  timeout: 30000
})

class ItemService extends BaseService {
  async getItem (itemId: string): Promise<any> {
    apiClient.defaults.headers.common.Authorization = `${wawiApiKey}`

    const { data } = await apiClient.get(`/items/${itemId}`)

    return data
  }

  async createItem (item: object): Promise<any> {
    apiClient.defaults.headers.common.Authorization = `${wawiApiKey}`

    const { data } = await apiClient.post('/items', item)

    return data
  }
}

export default ItemService
