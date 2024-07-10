import { IProductGraduatedPrice } from '../types'

export const getMaximumProductOrderQuantity = (maximumOrderQuantity: number, graduatedPrices: IProductGraduatedPrice[]): number => {
  if (graduatedPrices.length > 0) {
    return Math.max(...graduatedPrices.map(price => price.lastUnit))
  } else {
    return maximumOrderQuantity
  }
}
