# URL Shortener

A simple URL shortening service built with NestJS, PostgreSQL, and Docker. It allows users to shorten URLs, track stats, and redirect to original links, with features like rate limiting and caching.

## Features

- Shorten URLs: Convert long URLs into short, manageable links (e.g., http://localhost:3000/abc123).

- Redirect: Redirect users from a short URL to the original URL.

- Stats Tracking: View stats for a shortened URL, including the original URL, visit count, and creation date.

- Metrics Endpoint: Expose a /metrics endpoint to show the total number of redirects across all URLs.

- Rate Limiting: Limit usage to 100 requests per IP per day to prevent abuse.

- In-Memory Caching: Cache URL stats to reduce database queries and improve performance.

- API Documentation: Interactive Swagger (OpenAPI) documentation for easy API exploration.

- Dockerized: Containerized with Docker and Docker Compose for easy setup and deployment.

- Unit Tests: Comprehensive unit tests for core functionality.



## Tech Stack

- **Backend**: NestJS
- **Database**: PostgreSQL (Prisma ORM)
- **Containerization**: Docker
- **Rate Limiting**: `@nestjs/throttler`
- **API Docs**: Swagger

## Setup

### Using Docker

1. **Clone the Repo**:
   ```bash
   git clone <repository-url>
   cd url-shortener
   ```

2. **Set Up Environment:**  
    ```bash
   cp .env.example .env
   ```

3. **Start Containers:** 
  ```bash
   docker-compose up --build
   ```
4. **Apply Migrations:**
  ```bash
   docker exec -it <container_id> npx prisma migrate dev --name init
   ```

5. **Access:**
- API: http://localhost:3000
- Swagger: http://localhost:3000/api


## Local Setup 

1. **Install dependencies:**
```bash
npm install
```
2. Set up PostgreSQL and update .env with your DATABASE_URL.

3. **Apply migrations:**
```bash
npx prisma migrate dev --name init
``` 

4. **Start:**
```bash
npm run start:dev

```
## Usage

### Shorten URL:
Send a POST request to `/shorten` with a JSON body containing the URL to shorten:
```bash
POST http://localhost:3000/shorten
Content-Type: application/json

{
  "url": "https://example.com"
}
```

Response:

```json
{
  "shortUrl": "http://localhost:3000/abc123"
}
```


### Redirect:
Visit the short URL to redirect to the original URL:
```bash
GET http://localhost:3000/abc123
```
This will redirect to https://example.com and increment the visit count.


## Get URL Stats:
Retrieve stats for a shortened URL:
```bash
GET http://localhost:3000/stats/abc123
```
Response:

```json
{
  "originalUrl": "https://example.com",
  "visits": 1,
  "createdAt": "2025-05-13T12:34:56Z"
}
```

## Get Total Redirect Metrics:
Get the total number of redirects across all shortened URLs:
```bash
GET http://localhost:3000/metrics
```
Response:

```json
{
  "totalRedirects": 150
}
```
Note: The API is rate-limited to 100 requests per IP per day. Exceeding this limit will result in a 429 (Too Many Requests) response.

## API Documentation

The API is documented using Swagger. Access the interactive documentation at:
```bash
http://localhost:3000/api
```
This provides a UI to explore and test all endpoints, including request schemas and possible responses.


## Testing

The project includes unit tests for `UrlService` and `UrlController`, located in the `test/url/` folder.

Run tests inside the Docker container:
```bash
docker exec -it <container_id> npm run test
```
Or locally:
```bash
npm run test
```


## Assumptions


- Shortened URLs use the format http://localhost:3000/:hash, where hash is a 6-character random string.



- Hash collisions are handled by regenerating a new hash if a collision occurs.



- Routes in UrlController are ordered to ensure static routes (e.g., /metrics, /stats/:hash) are matched before the dynamic route (/:hash).



- The application uses an in-memory cache for URL stats, which persists only for the lifetime of the application instance.



- Rate limiting is applied globally to all endpoints using **`@nestjs/throttler`**.

