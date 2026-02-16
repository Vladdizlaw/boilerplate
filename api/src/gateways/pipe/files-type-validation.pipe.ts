import { Injectable, PipeTransform, BadRequestException, ParseFilePipe } from '@nestjs/common'
import { Request } from 'express'

@Injectable()
export class FilesTypeValidationPipe implements PipeTransform {
  constructor(private readonly allowedTypes: string[]) {}

  transform(values: Express.Multer.File[]) {
    if (!values) {
      throw new BadRequestException('No file provided')
    }
    for (const file of values) {
      if (!this.isFileTypeValid(file)) {
        throw new BadRequestException(
          `Invalid file type. Allowed types: ${this.allowedTypes.join(', ')}`
        )
      }
    }

    return values
  }

  private isFileTypeValid(file: Express.Multer.File): boolean {
    const fileMimeType = file.mimetype
    return this.allowedTypes.includes(fileMimeType)
  }
}
