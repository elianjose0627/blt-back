import db from '../../models'

class TitleDataSource {
  async getAll (limit: number, page: number): Promise<any> {
    const response = await db.Title.findAndCountAll({
      limit,
      offset: (page - 1) * limit
    })

    return response
  }

  async getById (id: number): Promise<any> {
    const response = await db.Title.findByPk(id)
    return response
  }
}

export default TitleDataSource
