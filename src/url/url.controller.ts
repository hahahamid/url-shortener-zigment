import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { ShortenUrlResponseDto } from './dto/shorten-url-response.dto';
import { UrlStatsResponseDto } from './dto/url-stats-response.dto';
import { MetricsResponseDto } from './dto/metrics-response.dto';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';

@ApiTags('URL Shortener')
@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}
 
  // This endpoint shortens a given URL and returns the shortened URL.
  
  @Post('shorten')
  @ApiOperation({ summary: 'Shorten a URL' })
  @ApiBody({ type: CreateUrlDto })
  @ApiResponse({
    status: 200,
    description: 'Returns the shortened URL.',
    type: ShortenUrlResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Rate limit exceeded. Max 100 requests per IP per day.',
  })
  async shorten(
    @Body() createUrlDto: CreateUrlDto,
  ): Promise<ShortenUrlResponseDto> {
    const result = await this.urlService.shorten(createUrlDto.url);
    return { shortUrl: result.shortUrl };
  }


  // This endpoint retrieves stats for a shortened URL, including the original URL, number of visits, and creation date.

  @Get('stats/:hash')
  @ApiOperation({ summary: 'Get stats for a shortened URL' })
  @ApiParam({
    name: 'hash',
    description: 'The shortened URL hash',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns stats for the shortened URL.',
    type: UrlStatsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  @ApiTooManyRequestsResponse({
    description: 'Rate limit exceeded. Max 100 requests per IP per day.',
  })
  async getStats(@Param('hash') hash: string): Promise<UrlStatsResponseDto> {
    const url = await this.urlService.getUrlByHash(hash);
    if (url) {
      return {
        originalUrl: url.originalUrl,
        visits: url.visits,
        createdAt: url.createdAt,
      };
    } else {
      throw new NotFoundException('URL not found');
    }
  }


  // This endpoint retrieves the total number of redirects across all shortened URLs.

  @Get('metrics')
  @ApiOperation({ summary: 'Get total redirect count' })
  @ApiResponse({
    status: 200,
    description:
      'Returns the total number of redirects across all shortened URLs.',
    type: MetricsResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Rate limit exceeded. Max 100 requests per IP per day.',
  })
  async getMetrics(): Promise<MetricsResponseDto> {
    const totalRedirects = await this.urlService.getTotalRedirectCount();
    return { totalRedirects };
  }


  // This endpoint redirects to the original URL based on the shortened URL hash.
  
  @Get(':hash')
  @ApiOperation({ summary: 'Redirect to the original URL' })
  @ApiParam({
    name: 'hash',
    description: 'The shortened URL hash',
    example: 'abc123',
  })
  @ApiResponse({ status: 302, description: 'Redirects to the original URL.' })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  @ApiTooManyRequestsResponse({
    description: 'Rate limit exceeded. Max 100 requests per IP per day.',
  })
  async redirect(@Param('hash') hash: string, @Res() res: Response) {
    const url = await this.urlService.getUrlByHash(hash);
    if (url) {
      await this.urlService.incrementVisits(hash);
      return res.redirect(url.originalUrl);
    } else {
      return res.status(404).send('Not found');
    }
  }
}
