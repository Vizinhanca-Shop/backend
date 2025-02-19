import { Injectable, BadRequestException } from '@nestjs/common'
import {
  S3,
  GetObjectCommandOutput,
  CompleteMultipartUploadCommandOutput,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { generateRandomImageName } from 'src/utils'

@Injectable()
export class S3Service {
  private s3: S3

  constructor() {
    this.s3 = new S3({
      region: process.env.AWS_S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<CompleteMultipartUploadCommandOutput> {
    if (!file?.originalname) return

    console.log('file', file)

    const envornmentFolder = process.env.ENVIRONMENT

    file.originalname = `${generateRandomImageName()}.${file.originalname
      .split('.')
      .pop()}`

    try {
      const res = new Upload({
        client: this.s3,
        params: {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `${envornmentFolder}/${folder}/${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        },
      }).done()

      return res
    } catch (error) {
      new BadRequestException('File get failed')
      return
    }
  }

  async deleteFile(key: string, bucket: string): Promise<void> {
    const params = {
      Bucket: bucket,
      Key: key,
    }

    try {
      await this.s3.deleteObject(params)
    } catch (error) {
      new BadRequestException('failed to delete file')
      return
    }
  }

  async getFile(key: string): Promise<GetObjectCommandOutput> {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    }

    try {
      return await this.s3.getObject(params)
    } catch (error) {
      new BadRequestException('File get failed')
      return
    }
  }
}
