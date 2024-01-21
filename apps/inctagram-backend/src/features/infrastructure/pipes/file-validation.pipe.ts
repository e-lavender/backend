import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private maxSize: number, private validType: string[]) {}
  transform(value: any, metadata: ArgumentMetadata) {
    const error = {
      field: value.fieldname,
      messages: [],
    };

    if (value.size > this.maxSize) {
      error.messages.push('The file size should not be larger than 10mb');
    }

    if (!this.validType.includes(value.mimetype.split('/')[1])) {
      error.messages.push('The file format is not valid');
    }

    if (error.messages.length) {
      throw new BadRequestException({ message: [error] });
    }

    return value;
  }
}
