import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CodeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  code: string;
}
