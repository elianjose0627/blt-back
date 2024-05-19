import db from '../models'
import { CustomNext, CustomRequest, CustomResponse, IUser } from '../types'

const getUser = async (id: string): Promise<any> => db.User.findOne({
  attributes: ['id'],
  include: [
    {
      model: db.Company,
      attributes: ['id'],
      as: 'company',
      include: [
        {
          model: db.ProductAccessControlGroup,
          as: 'productAccessControlGroups',
          attributes: ['id', 'name'],
          through: {
            attributes: []
          },
          include: [
            {
              model: db.ProductCategoryTag,
              as: 'productCategoryTags',
              attributes: ['id', 'name'],
              through: {
                attributes: []
              }
            }
          ],
          required: false
        }
      ]
    },
    {
      model: db.ProductAccessControlGroup,
      as: 'productAccessControlGroups',
      attributes: ['id', 'name'],
      through: {
        attributes: []
      },
      include: [
        {
          model: db.ProductCategoryTag,
          as: 'productCategoryTags',
          attributes: ['id', 'name'],
          through: {
            attributes: []
          }
        }
      ],
      required: false
    },
    {
      model: db.CompanyUserGroup,
      as: 'companyUserGroups',
      attributes: ['id', 'name'],
      through: {
        attributes: []
      },
      required: false,
      include: [
        {
          model: db.ProductAccessControlGroup,
          as: 'accessControlGroups',
          attributes: ['id', 'name'],
          include: [
            {
              model: db.ProductCategoryTag,
              as: 'productCategoryTags',
              attributes: ['id', 'name'],
              through: {
                attributes: []
              }
            }
          ]
        }
      ]
    }
  ],
  where: {
    id
  }
})
const setCatalogueAccess = async (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> => {
  const { id } = req.user
  const user: IUser = await getUser(id)
  const {
    productAccessControlGroups,
    company,
    companyUserGroups
  } = user

  const userProductAccessControlGroups = productAccessControlGroups
  const companyProductAccessControlGroups = company?.productAccessControlGroups ?? []
  const companyUserGroupProductAccessControlGroups = companyUserGroups.flatMap(companyUserGroup => companyUserGroup.accessControlGroups)

  const allAccessControlGroups = [
    ...userProductAccessControlGroups,
    ...companyProductAccessControlGroups,
    ...companyUserGroupProductAccessControlGroups
  ]

  const allProductCategoryTagIds = allAccessControlGroups
    .flatMap(group => group.productCategoryTags)
    .map(tag => tag.id)

  const productCategoryTags = [...new Set(allProductCategoryTagIds)]

  req.accessProductCategoryTags = productCategoryTags

  return next()
}

export default setCatalogueAccess
