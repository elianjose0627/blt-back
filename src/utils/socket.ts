// eslint-disable-next-line @typescript-eslint/no-var-requires
const io = require('socket.io')()

const startSocket = (server: any): any => {
  io.attach(server)
}

export {
  startSocket,
  io
}
