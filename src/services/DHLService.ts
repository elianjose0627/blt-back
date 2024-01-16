import axios from 'axios'

const baseURL = String(process.env.DHL_API_URL)
const dhlAPIKey = process.env.DHL_API_KEY

const apiClient: any = axios.create({
  baseURL: `${baseURL}`,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 20000
})

export default {
  trackDHLShipments (trackingNumber: string) {
    const config = {
      params: {
        trackingNumber
      },
      headers: { 'DHL-API-Key': dhlAPIKey }
    }
    return apiClient.get('track/shipments', config)
  }
}
