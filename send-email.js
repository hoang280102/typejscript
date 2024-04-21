/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { SendEmailCommand, SESClient } = require('@aws-sdk/client-ses')
const { config } = require('dotenv')

config()
// Create SES service object.
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID
  }
})

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

const sendVerifyEmail = async (toAddress, subject, body) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: process.env.SES_FROM_ADDRESS,
    toAddresses: toAddress,
    body,
    subject
  })

  try {
    const result = await sesClient.send(sendEmailCommand)
    console.log('success')
    return result
  } catch (e) {
    console.error('Failed to send email.')
    return e
  }
}

sendVerifyEmail(
  'anang9173@gmail.com',
  'Tiêu đề email:Gửi tới cậu một lời chúc mong dành cậu làm việc tốt hihi',
  '<h1>Hello world</h1>'
)
