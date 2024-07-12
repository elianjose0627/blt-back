import { IProductGraduatedPrice } from '../types'

export const getMinimumProductOrderQuantity = (minimumOrderQuantity: number, graduatedPrices: IProductGraduatedPrice[]): number => {
  if (graduatedPrices.length > 0) {
    return Math.min(...graduatedPrices.map(price => price.firstUnit))
  } else {
    return Math.max(minimumOrderQuantity, 1)
  }
}
