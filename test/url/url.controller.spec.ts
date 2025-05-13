import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from '../../src/url/url.controller';
import { UrlService } from '../../src/url/url.service';
import { Response } from 'express';

describe('UrlController', () => {
  let controller: UrlController;
  let service: UrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: {
            getUrlByHash: jest.fn() as jest.Mock, // Explicitly type as jest.Mock
            incrementVisits: jest.fn() as jest.Mock,
            getTotalRedirectCount: jest.fn() as jest.Mock,
          },
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    service = module.get<UrlService>(UrlService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to the original URL and increment visits', async () => {
    const hash = 'abc123';
    const url = { hash, originalUrl: 'https://example.com', visits: 0 };
    (service.getUrlByHash as jest.Mock).mockResolvedValue(url);

    // Mock Express Response object
    const res = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    await controller.redirect(hash, res);

    expect(service.getUrlByHash).toHaveBeenCalledWith(hash);
    expect(service.incrementVisits).toHaveBeenCalledWith(hash);
    expect(res.redirect).toHaveBeenCalledWith(url.originalUrl);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it('should return 404 if the hash is not found', async () => {
    const hash = 'invalid';
    (service.getUrlByHash as jest.Mock).mockResolvedValue(null);

    // Mock Express Response object
    const res = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    await controller.redirect(hash, res);

    expect(service.getUrlByHash).toHaveBeenCalledWith(hash);
    expect(service.incrementVisits).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Not found');
  });

  it('should return the total redirect count', async () => {
    const totalRedirects = 150;
    (service.getTotalRedirectCount as jest.Mock).mockResolvedValue(
      totalRedirects,
    );

    const result = await controller.getMetrics();

    expect(service.getTotalRedirectCount).toHaveBeenCalled();
    expect(result).toEqual({ totalRedirects });
  });
});
