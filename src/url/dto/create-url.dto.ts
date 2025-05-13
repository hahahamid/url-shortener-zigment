import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({
    description: 'The URL to shorten',
    example: 'https://www.example.com',
  })
  @IsUrl()
  url: string;
}
