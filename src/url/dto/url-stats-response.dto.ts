import { ApiProperty } from '@nestjs/swagger';

export class UrlStatsResponseDto {
  @ApiProperty({ 
    description: 'The original URL', 
    example: 'https://example.com/very/long/url' 
  })
  originalUrl: string;

  @ApiProperty({ 
    description: 'Number of visits to the shortened URL', 
    example: 42 
  })
  visits: number;

  @ApiProperty({ 
    description: 'Date and time when the URL was shortened', 
    example: '2024-05-10T10:00:00Z' 
  })
  createdAt: Date;
}