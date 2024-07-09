import * as statusCodes from '../constants/statusCodes'
import db from '../models'
import type { CustomNext, CustomRequest, CustomResponse, IProduct, RequestBodyPendingOrders } from '../types'

const checkMinimumProductOrderQuantity = async (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> => {
  const { pendingOrders } = req.body as RequestBodyPendingOrders

  const pendingOrderLineRequests = pendingOrders.flatMap(pendingOrder => pendingOrder.orderLineRequests)
  const merchantSkus = pendingOrderLineRequests.map(orderLineRequest => (orderLineRequest.articleNumber))
  const products: IProduct[] = await db.Product.findAll({
    where: {
      merchantSku: merchantSkus
    },
    include: [
      {
        model: db.Stock,
        as: 'stock',
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt', 'productId']
        }
      }
    ]
  })

  for (const pendingOrderLineRequest of pendingOrderLineRequests) {
    const { quantity } = pendingOrderLineRequest
    const foundProduct = products.find(product => product.merchantSku === pendingOrderLineRequest.articleNumber)

    if (foundProduct === undefined) {
      return res.status(statusCodes.NOT_FOUND).send({
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: `Article ${pendingOrderLineRequest.itemName} with Article Number ${pendingOrderLineRequest.articleNumber} not found`
        }
      })
    }

    if (quantity < foundProduct.minimumOrderQuantity) {
      return res.status(statusCodes.BAD_REQUEST).send({
        statusCode: statusCodes.BAD_REQUEST,
        success: false,
        errors: {
          message: `Article ${pendingOrderLineRequest.itemName} with Article Number ${pendingOrderLineRequest.articleNumber} should have a minimum order quantity of ${foundProduct.minimumOrderQuantity}`
        }
      })
    }
  }

  return next()
}

export default checkMinimumProductOrderQuantity
