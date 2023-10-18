import type { CustomNext, CustomRequest, CustomResponse } from '../types'

const paginate = (req: CustomRequest, res: CustomResponse, next: CustomNext): any => {
  let { limit, page }: { limit: number, page: number} = req.query

  page = page ?? 1
  limit = limit ?? 20

  if (page < 1) { page = 1 }
  if (limit < 0) { limit = 20 }

  const offset = limit * (page - 1)

  req.query.limit = limit
  req.query.offset = offset
  req.query.page = page
  return next()
}

export default paginate
