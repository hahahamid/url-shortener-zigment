import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShortenUrlResponseDto } from './dto/shorten-url-response.dto';

@Injectable()
export class UrlService {
  constructor(private prisma: PrismaService) {}

  // Cache for URL stats  
  private statsCache: {
    [hash: string]: { originalUrl: string; visits: number; createdAt: Date };
  } = {};


  // Generate a random hash for the shortened URL
  // The hash is a combination of letters and numbers, and its length can be adjusted.

  private generateHash(length: number = 6): string {
    const characters =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }



  // Shorten a given URL and store it in the database
  // The method generates a unique hash for the URL and checks if it already exists in the database.

  
  async shorten(originalUrl: string): Promise<ShortenUrlResponseDto> {
    let hash: string;
    let existingUrl;
    do {
      hash = this.generateHash();
      existingUrl = await this.prisma.url.findUnique({ where: { hash } });
    } while (existingUrl);
    const url = await this.prisma.url.create({
      data: {
        hash,
        originalUrl,
        visits: 0,
      },
    });
    return { shortUrl: `http://localhost:3000/${hash}` };
  }



  // Retrieve URL stats from the database
  // The method first checks if the stats are cached. If not, it queries the database for the URL stats.

  async getUrlByHash(hash: string) {
    // Check cache first
    if (this.statsCache[hash]) {
      return this.statsCache[hash];
    }

    // If not in cache, query the database
    const url = await this.prisma.url.findUnique({ where: { hash } });
    if (url) {
      // Cache the result
      this.statsCache[hash] = {
        originalUrl: url.originalUrl,
        visits: url.visits,
        createdAt: url.createdAt,
      };
    }
    return url;
  }



  // Increment the visit count for a given URL
  // The method updates the visit count in the database and also updates the cache.
  
  async incrementVisits(hash: string): Promise<void> {
    await this.prisma.url.update({
      where: { hash },
      data: { visits: { increment: 1 } },
    });
  }

  async getTotalRedirectCount(): Promise<number> {
    const result = await this.prisma.url.aggregate({
      _sum: {
        visits: true,
      },
    });
    return result._sum.visits ?? 0;
  }
}
