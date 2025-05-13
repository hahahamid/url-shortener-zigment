import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://url-shortener_owner:npg_a3u8ZdmHsVqR@ep-nameless-frost-a4g3unww-pooler.us-east-1.aws.neon.tech/url-shortener?sslmode=require', // Replace with your URL
    },
  },
});

async function main() {
  try {
    await prisma.$connect();
    console.log('Connected to database successfully');
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();