import axios from 'axios'

const baseURL = String(process.env.SLACK_WEBHOOK_SERVICE_URL)
const slackChannelPath = String(process.env.SLACK_CHANNEL_WEBHOOK_PATH)

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
  postToSlackChannel (data: { text: string }) {
    return apiClient.post(`${slackChannelPath}`, data)
  }
}
