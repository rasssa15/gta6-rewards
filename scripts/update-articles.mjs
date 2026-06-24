import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const updates = [
  {
    slug: 'gta-6-release-date-fall-2025',
    data: {
      title: 'GTA 6 Release Date Confirmed — Launching November 19, 2026',
      excerpt: 'Rockstar Games has officially confirmed that Grand Theft Auto VI will launch on November 19, 2026 for PlayStation 5 and Xbox Series X|S. Pre-orders begin June 25, 2026.',
      featuredImage: 'https://upload.wikimedia.org/wikipedia/en/4/46/Grand_Theft_Auto_VI.png',
      seoTitle: 'GTA 6 Release Date November 19, 2026 Confirmed by Rockstar',
      seoDesc: 'Grand Theft Auto VI officially launches November 19, 2026 on PS5 and Xbox Series X|S. Pre-orders start June 25. Standard edition $79.99, Ultimate Edition $99.99.',
    }
  },
  {
    slug: 'gta-6-first-female-protagonist',
    data: {
      featuredImage: 'https://assets-prd.ignimgs.com/2025/05/06/real-dimez-02-1746542282124.jpg?width=1280',
    }
  },
  {
    slug: 'gta-6-map-size-2x-gta-5',
    data: {
      featuredImage: 'https://sm.ign.com/t/ign_nordic/gallery/g/gta-6-vint/gta-6-vintage-vice-city-pack-screenshots_yqdz.1400.jpg',
    }
  },
  {
    slug: 'gta-6-online-2-0-confirmed',
    data: {
      featuredImage: 'https://upload.wikimedia.org/wikipedia/en/4/46/Grand_Theft_Auto_VI.png',
    }
  },
  {
    slug: 'gta-6-ps5-pro-60-fps',
    data: {
      featuredImage: 'https://sm.ign.com/t/ign_nordic/gallery/g/gta-6-vint/gta-6-vintage-vice-city-pack-screenshots_yqdz.1400.jpg',
    }
  },
];

for (const update of updates) {
  const article = await prisma.article.update({
    where: { slug: update.slug },
    data: update.data,
  });
  console.log(`Updated: ${article.title} (${article.slug})`);
  console.log(`  Image: ${article.featuredImage.substring(0, 60)}...`);
}

await prisma.$disconnect();
console.log('\nAll articles updated successfully!');
