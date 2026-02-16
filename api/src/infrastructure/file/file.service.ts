import { Injectable, Logger } from '@nestjs/common';
import { Express } from 'express';

import { generateFileName } from './helpers/generate-filename.helper';
import * as AWS from 'aws-sdk';

import { ConfigService } from '@nestjs/config';

import { getFileTypeFromExt } from './helpers/get-filetype.helper';
import { AttachmentRepository } from 'src/domain/ports/attachment.repository.interface';
import {
  IAttachment,
  ResourceEnum,
} from 'src/domain/interfaces/attachment.interface';

@Injectable()
export class FileService {
  private logger = new Logger(FileService.name);
  private readonly s3Stream;
  constructor(
    private readonly attachmentRepository: AttachmentRepository,
    private readonly configService: ConfigService,
  ) {
    this.s3Stream = new AWS.S3({
      accessKeyId: configService.get('MINIO_ROOT_USER'),
      secretAccessKey: configService.get('MINIO_SECRET_KEY'),
      endpoint: configService.get('MINIO_ENDPOINT'),
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
      region: 'localhost',
    });
  }

  async setBucketPolicy() {
    await this.s3Stream.listBuckets(async (err, data) => {
      if (err) throw err;
      else {
        const Buckets = data?.Buckets;
        const buckets = Buckets?.map((b) => b?.Name);

        if (!buckets.includes(this.configService.get('MINIO_BUCKET'))) {
          await this.s3Stream
            .createBucket({
              Bucket: this.configService.get('MINIO_BUCKET'),
            })
            .promise();

          const readOnlyAnonUserPolicy = {
            Version: '2012-10-17',
            Statement: [
              {
                Sid: 'AddPerm',
                Effect: 'Allow',
                Principal: '*',
                Action: ['s3:GetObject'],
                Resource: [
                  `arn:aws:s3:::${this.configService.get('MINIO_BUCKET')}/*`,
                ],
              },
            ],
          };
          const bucketPolicyParams = {
            Bucket: this.configService.get('MINIO_BUCKET'),
            Policy: JSON.stringify(readOnlyAnonUserPolicy),
          };

          await this.s3Stream.putBucketPolicy(bucketPolicyParams).promise();
        }
      }
    });
  }

  async uploadFiles(
    files: Express.Multer.File[],
    resource: ResourceEnum,
    userId: number,
    resourceId?: number,
    contentEncoding?: string,
  ) {
    try {
      let result = [] as number[];
      await this.setBucketPolicy();
      for await (const file of files) {
        const filename = generateFileName(file.originalname);
        const params = {
          Bucket: this.configService.get('MINIO_BUCKET'),
          Key: filename,
          ACL: 'public-read',
          ContentType: file.mimetype,
          Body: file.buffer,
        };

        if (contentEncoding) {
          params['ContentEncoding'] = contentEncoding;
        }

        await this.s3Stream.upload(params).promise();

        const attachment = {
          original_file_name: file.originalname,
          file_name: filename,
          path: `${this.configService.get('DOMAIN')}/${this.configService.get('MINIO_BUCKET')}/${filename}`,
          file_type: file.mimetype,
          user_id: userId,
          resource: resource,
          resource_id: resourceId,
        };

        const createdAttachment =
          await this.attachmentRepository.create(attachment);
        result.push(createdAttachment.id);
      }

      return result;
    } catch (err) {
      this.logger.log(
        `FileService:uploadFile : ${JSON.stringify(err.message)}`,
      );
      console.log(err);
      throw new Error(err.message);
    }
  }

  async uploadBase64File(
    file: string,
    name: string,
    account_id: number,
    resource: ResourceEnum,
    resource_id?: number,
    alfa_crm_path?: string,
    contentEncoding?: string,
  ) {
    try {
      const filename = generateFileName(name);
      await this.setBucketPolicy();
      const ext = name.split('.')[name.length - 1];
      const params = {
        Bucket: this.configService.get('MINIO_BUCKET'),
        Key: filename,
        ACL: 'public-read',
        ContentType: getFileTypeFromExt(ext),
        Body: Buffer.from(file, 'base64'),
      };

      if (contentEncoding) {
        params['ContentEncoding'] = contentEncoding;
      }

      await this.s3Stream.upload(params).promise();

      const attachment = {
        original_file_name: name,
        file_name: filename,
        path: `${this.configService.get('MINIO_BUCKET')}/${filename}`,
        file_type: getFileTypeFromExt(ext),
        resource: resource,
        resource_id: resource_id,
        account_id,
        alfa_crm_path,
      };

      const result = await this.attachmentRepository.create(attachment);
      console.log(result);
      return result;
    } catch (err) {
      this.logger.log(
        `FileService:uploadFile : ${JSON.stringify(err.message)}`,
      );
      console.log(err);
      throw new Error(err.message);
    }
  }

  async deleteFiles(ids: number[]) {
    try {
      const attachments = await this.attachmentRepository.findMany(ids);

      if (!attachments.length) throw new Error('File not found');

      const deletedFilesIds = [];
      await Promise.all(
        attachments.map(async (attachment) => {
          await this.s3Stream
            .deleteObject({
              Bucket: this.configService.get('MINIO_BUCKET'),
              Key: attachment.file_name,
            })
            .promise()
            .then((res) => deletedFilesIds.push(attachment.id))
            .catch((err) => console.log(err));
        }),
      );
      console.log(deletedFilesIds);
      const result = await this.attachmentRepository.delete(deletedFilesIds);
      return result;
    } catch (err) {
      this.logger.log(
        `FileService:deleteFile : ${JSON.stringify(err.message || err)}`,
      );
      throw new Error(err.message || err);
    }
  }

  async updateAttachments(id: number, attachment: Partial<IAttachment>) {
    return this.attachmentRepository.update(id, attachment);
  }

  async getAttachments(ids: number[]) {
    return this.attachmentRepository.findMany(ids);
  }

  async getFiles(key: string) {
    const file = await this.s3Stream
      .getObject({
        Bucket: this.configService.get('MINIO_BUCKET'),
        Key: key,
      })
      .promise();
    return file;
  }

  async bufferToBase64(buffer: Buffer): Promise<string> {
    return buffer.toString('base64');
  }
}
