import winston from 'winston'
import { LoggingWinston } from '@google-cloud/logging-winston'

const loggingWinston = new LoggingWinston({
  defaultCallback: err => {
    // eslint-disable-next-line no-console
    console.log(`LoggingWinston Callback: ${String(err)}`)
  }
})

// Create a Winston logger that streams to Stackdriver Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    // Add Stackdriver Logging
    loggingWinston
  ]
})

export default logger
