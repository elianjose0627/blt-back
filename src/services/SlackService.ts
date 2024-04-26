import axios from 'axios'
import { Environment } from '../types'

const baseURL = String(process.env.SLACK_WEBHOOK_SERVICE_URL)
const slackChannelPath = String(process.env.SLACK_CHANNEL_WEBHOOK_PATH)
const slackChannelPathTest = String(process.env.SLACK_CHANNEL_WEBHOOK_PATH_TEST)

const environment: Environment = process.env.NODE_ENV as Environment

const slackChannel: {[key: string]: string} = {
  test: slackChannelPathTest,
  development: slackChannelPathTest,
  staging: slackChannelPathTest,
  production: slackChannelPath
}

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
    return apiClient.post(`${slackChannel[environment]}`, data)
  }
}
