import axios from 'axios'

const baseURL = String(process.env.DOTNET_API_URL)
const apiKey = String(process.env.DOTNET_API_KEY)
const appSecret = String(process.env.DOTNET_APP_SECRET)

const apiClient: any = axios.create({
  baseURL: `${baseURL}/v1/auth`,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 20000
})

export default {
  getAuthToken () {
    const data = {
      apiKey,
      appSecret
    }
    return apiClient.post('token', data)
  },
  refreshAuthToken (token: string) {
    const data = {
      appSecret
    }
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
    return apiClient.post('token/refresh', data)
  }
}
