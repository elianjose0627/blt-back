import app from '../app'

const PORT = process.env.PORT ?? 8000

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`app running on port ${PORT}`)
})
