import express, { Router } from 'express'
import FileController from '../controllers/FileController'
import asyncHandler from '../middlewares/asyncHandler'
import { uploadToMemory } from '../middlewares/uploadFile'
import uploadFileToGCP from '../middlewares/uploadFileToGCP'
import checkAuthentication from '../middlewares/checkAuthentication'

const fileRoutes = (): Router => {
  const fileRouter = express.Router()

  fileRouter.use('/file', checkAuthentication)
  fileRouter.route('/file/upload')
    .post(asyncHandler(uploadToMemory), asyncHandler(uploadFileToGCP), asyncHandler(FileController.insertPendingOrder))
  return fileRouter
}

export default fileRoutes
