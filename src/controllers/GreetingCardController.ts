import Jspdf from 'jspdf'
import puppeteer from 'puppeteer'
import axios from 'axios'
import sgMail from '@sendgrid/mail'
import BaseController from './BaseController'
import GreetingCardService from '../services/GreetingCardService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

sgMail.setApiKey(String(process.env.SENDGRID_API_KEY))

const greetingCardService = new GreetingCardService('GreetingCard')

class GreetingCardController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { greetingCard } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await greetingCardService.insert({ greetingCard })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      [this.recordName()]: response
    })
  }

  async getAll (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset, filter, search } } = req
    const records = await greetingCardService.getAll(limit, offset, search, filter)
    const meta = {
      total: records.count,
      pageCount: Math.ceil(records.count / limit),
      perPage: limit,
      page
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      meta,
      [greetingCardService.manyRecords()]: records.rows
    })
  }

  async printCard (req: CustomRequest, res: CustomResponse): Promise<any> {
    const {
      body: {
        print: {
          htmlText, imageUrl, placeholders, frontOrientation = 'portrait', backOrientation = 'portrait',
          email: { to, from, subject, text }, exportSides = 'both'
        }
      }
    } = req

    const compressPdf = true
    const width = frontOrientation === 'landscape' ? 842 : 595
    const height = frontOrientation === 'landscape' ? 595 : 842

    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })

    const replacedHtmlText = htmlText.replace(/\[(\w+)\]/g, (placeholder: string) =>
      placeholders[placeholder.substring(1, placeholder.length - 1)]
    )

    const browser = await puppeteer.launch({
      headless: 'new'
    })
    const page = await browser.newPage()
    await page.setContent(replacedHtmlText, { waitUntil: 'domcontentloaded' })
    await page.emulateMediaType('screen')

    const pdfBufferBack = await page.pdf({
      format: 'A4',
      landscape: backOrientation === 'landscape',
      scale: 1.29,
      printBackground: true
    })

    await browser.close()

    const doc = new Jspdf(frontOrientation, 'px', [width, height], compressPdf)

    // Add the image to the PDF
    doc.addImage(Buffer.from(response.data), 'JPEG', 0, 0, width, height)

    const pdfBufferFront = Buffer.from(doc.output('arraybuffer'))
    // Save the PDF as a file

    const pdfBase64Front = pdfBufferFront.toString('base64')
    const pdfBase64Back = pdfBufferBack.toString('base64')

    const frontSide = {
      filename: 'front.pdf',
      content: pdfBase64Front, // Read the PDF file
      type: 'application/pdf',
      disposition: 'attachment' // Set the disposition as an attachment
    }
    const backSide = {
      filename: 'back.pdf',
      content: pdfBase64Back, // Read the PDF file
      type: 'application/pdf',
      disposition: 'attachment' // Set the disposition as an attachment
    }

    const attachments: any = {
      front: [frontSide],
      back: [backSide],
      both: [frontSide, backSide]
    }

    const msg = {
      to,
      from,
      subject,
      text,
      attachments: attachments[exportSides]
    }
    await sgMail.send(msg)

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      greetingCard: {
        message: 'Greeting card email sent successfully'
      }
    })
  }
}

export default new GreetingCardController(greetingCardService)
