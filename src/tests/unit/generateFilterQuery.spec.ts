import chai from 'chai'
import sinonChai from 'sinon-chai'
import { generateFilterQuery } from '../../services/BaseService'
import { Op } from 'sequelize'

const { expect } = chai

chai.use(sinonChai)

describe('generateFilterQuery', () => {
  it('should return a filter query for equals', () => {
    const filterQuery = generateFilterQuery({
      'properties.color': 'red',
      'properties.material': 'cotton',
      'properties.size': 'L'
    })
    expect(filterQuery).to.be.an('object')
    expect(filterQuery).to.include.keys('properties.color', 'properties.material', 'properties.size')
    expect(filterQuery).to.deep.equal({
      'properties.color': { [Op.eq]: 'red' },
      'properties.material': { [Op.eq]: 'cotton' },
      'properties.size': { [Op.eq]: 'L' }
    })
  })

  it('should return a filter query for in', () => {
    const filterQuery = generateFilterQuery({
      tags: 'tractor, harvester'
    }, 'in')
    expect(filterQuery).to.be.an('object')
    expect(filterQuery).to.include.keys('tags')
    expect(filterQuery).to.deep.equal({ tags: { [Op.in]: ['tractor', ' harvester'] } })
  })
})
