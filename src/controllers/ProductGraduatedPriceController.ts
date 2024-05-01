import BaseController from './BaseController'
import ProductGraduatedPriceService from '../services/ProductGraduatedPriceService'

const productGraduatedPriceService = new ProductGraduatedPriceService('ProductGraduatedPrice')

class ProductGraduatedPriceController extends BaseController {

}

export default new ProductGraduatedPriceController(productGraduatedPriceService)
