import AWS from 'aws-sdk'
import { PutObjectRequest } from 'aws-sdk/clients/s3'

export const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY_COLLAPP,
})

export function getParams(key: string, body?: Buffer): PutObjectRequest {
  return {
    Bucket: process.env.AWS_BUCKET
      ? process.env.AWS_BUCKET
      : 'aws.collapp.live',
    Key: key,
    //Region: 'us-east-1',
    Body: body,
  }
}

export const amazonUrl = 'http://aws.collapp.live/'
