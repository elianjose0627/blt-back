import app from '../app'
import {
  startSocket
} from '../utils/socket'

const PORT = process.env.PORT ?? 8000

const server = app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`)
})

startSocket(server)
