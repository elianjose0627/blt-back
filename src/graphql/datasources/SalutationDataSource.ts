import db from '../../models'

class SalutationDataSource {
  async getAll (limit: number, page: number): Promise<any> {
    const response = await db.Salutation.findAndCountAll({
      limit,
      offset: (page - 1) * limit
    })

    return response
  }

  async getById (id: number): Promise<any> {
    const response = await db.Salutation.findByPk(id)
    return response
  }
}

export default SalutationDataSource
