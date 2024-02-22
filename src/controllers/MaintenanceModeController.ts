import BaseController from './BaseController'
import MaintenanceModeService from '../services/MaintenanceModeService'

const maintenanceModeService = new MaintenanceModeService('MaintenanceMode')

class MaintenanceModeController extends BaseController {

}

export default new MaintenanceModeController(maintenanceModeService)
