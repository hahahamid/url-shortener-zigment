import { ApiProperty } from '@nestjs/swagger';

export class MetricsResponseDto {
  @ApiProperty({ 
    description: 'The total number of redirects across all shortened URLs', 
    example: 150 
  })
  totalRedirects: number;
}