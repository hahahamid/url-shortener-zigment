import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from '../../src/url/url.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('UrlService', () => {
  let service: UrlService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: PrismaService,
          useValue: {
            url: {
              findUnique: jest.fn() as jest.Mock, 
              create: jest.fn() as jest.Mock,
              update: jest.fn() as jest.Mock,
            },
          },
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should shorten a URL and return a short URL', async () => {
    const originalUrl = 'https://example.com';
    const hash = 'abc123';

    // Mock the internal generateHash method
    jest.spyOn(service as any, 'generateHash').mockReturnValue(hash);
    (prisma.url.findUnique as jest.Mock).mockResolvedValue(null); // No collision
    (prisma.url.create as jest.Mock).mockResolvedValue({ hash, originalUrl, visits: 0 });

    const result = await service.shorten(originalUrl);

    expect(result).toEqual({ shortUrl: `http://localhost:3000/${hash}` });
    expect(prisma.url.findUnique).toHaveBeenCalledWith({ where: { hash } });
    expect(prisma.url.create).toHaveBeenCalledWith({
      data: { hash, originalUrl, visits: 0 },
    });
  });

  it('should handle hash collision by generating a new hash', async () => {
    const originalUrl = 'https://example.com';
    const hash1 = 'abc123';
    const hash2 = 'def456';

    // Mock generateHash to return hash1 (collision) then hash2 (unique)
    jest.spyOn(service as any, 'generateHash').mockReturnValueOnce(hash1).mockReturnValueOnce(hash2);
    (prisma.url.findUnique as jest.Mock).mockResolvedValueOnce({ hash: hash1 }); // Collision
    (prisma.url.findUnique as jest.Mock).mockResolvedValueOnce(null); // No collision
    (prisma.url.create as jest.Mock).mockResolvedValue({ hash: hash2, originalUrl, visits: 0 });

    const result = await service.shorten(originalUrl);

    expect(result).toEqual({ shortUrl: `http://localhost:3000/${hash2}` });
    expect(prisma.url.findUnique).toHaveBeenCalledTimes(2);
    expect(prisma.url.findUnique).toHaveBeenCalledWith({ where: { hash: hash1 } });
    expect(prisma.url.findUnique).toHaveBeenCalledWith({ where: { hash: hash2 } });
    expect(prisma.url.create).toHaveBeenCalledWith({
      data: { hash: hash2, originalUrl, visits: 0 },
    });
  });
});