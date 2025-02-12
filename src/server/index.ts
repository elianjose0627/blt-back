import { appHttpServer } from '../app'

const PORT = process.env.PORT ?? 8000

appHttpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`app running on port ${PORT}`)
})
