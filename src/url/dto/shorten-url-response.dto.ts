import { ApiProperty } from '@nestjs/swagger';

export class ShortenUrlResponseDto {
  @ApiProperty({ 
    description: 'The shortened URL', 
    example: 'http://localhost:3000/abc123' 
  })
  shortUrl: string;
}