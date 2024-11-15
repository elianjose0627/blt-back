import db from '../../models'
import BaseService from '../BaseService'
import axios from 'axios'

const baseURL = process.env.JTL_API_URL as string

const apiClient: any = axios.create({
  baseURL: `${baseURL}/api/v1/merchant`,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 30000
})

class InboundService extends BaseService {
  async getInbound (inboundId: string): Promise<any> {
    const token = await db.Token.findOne()
    const { accessToken } = token
    apiClient.defaults.headers.common.Authorization = `Bearer ${String(accessToken)}`

    const { data } = await apiClient.get(`/inbounds/${inboundId}`)

    return data
  }

  async getShippingNotifications (inboundId: string): Promise<any> {
    const token = await db.Token.findOne()
    const { accessToken } = token
    apiClient.defaults.headers.common.Authorization = `Bearer ${String(accessToken)}`

    const { data } = await apiClient.get(`/inbounds/${inboundId}/shipping-notifications`)

    return data
  }
}

export default InboundService
