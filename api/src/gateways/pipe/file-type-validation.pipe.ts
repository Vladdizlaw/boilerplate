import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common'
import { Request } from 'express'

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
    constructor(private readonly allowedTypes: string[]) {}

    transform(value: any) {
        if (!value) {
            throw new BadRequestException('No file provided')
        }

        if (!this.isFileTypeValid(value)) {
            throw new BadRequestException(
                `Invalid file type. Allowed types: ${this.allowedTypes.join(', ')}`
            )
        }
        console.log({ value })
        return value
    }

    private isFileTypeValid(file: Express.Multer.File): boolean {
        const fileMimeType = file.mimetype
        return this.allowedTypes.includes(fileMimeType)
    }
}
