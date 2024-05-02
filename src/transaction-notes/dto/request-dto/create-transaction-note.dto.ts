import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTransactionNoteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text: string;
}
