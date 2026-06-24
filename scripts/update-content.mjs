import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. Update the release date article with correct Nov 19, 2026 info
const releaseContent = `<p>Rockstar Games has officially confirmed that Grand Theft Auto VI will launch on <strong>November 19, 2026</strong> for PlayStation 5 and Xbox Series X|S. The announcement was made alongside the reveal of the game's final cover art and pricing details.</p>
<p>After multiple delays — first from Fall 2025 to May 2026, and then to November 2026 — Rockstar and parent company Take-Two Interactive have stated the November 19 date is locked in. The game is being polished to "prevent a Cyberpunk scenario" according to insiders.</p>
<p>GTA 6 will be available in two editions: the <strong>Standard Edition at $79.99</strong> and the <strong>Ultimate Edition at $99.99</strong>. The Ultimate Edition includes exclusive in-game clothing, hairstyles, locations, tattoos, vehicles, weapons, and a Shore Court personal garage. All pre-orders receive the Vintage Vice City Pack, featuring items inspired by the original Grand Theft Auto: Vice City.</p>
<p>Physical versions of the game will be available but will only contain a download code — no disc is included in the box. Pre-orders go live on <strong>June 25, 2026</strong>.</p>
<p>Set in the fictional state of Leonida (based on Florida), GTA 6 follows criminal couple Jason Duval and Lucia Caminos in a Bonnie and Clyde-style story. The game world includes Vice City, Grassrivers, Leonida Keys, Ambrosia, Mount Kalaga National Park, and Port Gellhorn.</p>
<p>At launch, GTA 6 will be a single-player experience. Rockstar has not yet detailed the online multiplayer component, though GTA Online 2.0 is expected to arrive after launch. A PC release has not been officially confirmed for the November 19 date.</p>`;

await prisma.article.update({
  where: { slug: 'gta-6-release-date-fall-2025' },
  data: { content: releaseContent, updatedAt: new Date() },
});
console.log('Updated release date article');

// 2. Create article about GTA 6 price reveal
const priceSlug = 'gta-6-price-79-dollars-preorder-ultimate-edition';
const existingPrice = await prisma.article.findUnique({ where: { slug: priceSlug } });
if (!existingPrice) {
  await prisma.article.create({
    data: {
      title: 'GTA 6 Priced at $79.99 — Ultimate Edition at $99.99, Pre-Orders Open June 25',
      slug: priceSlug,
      excerpt: 'Grand Theft Auto VI will cost $79.99 for the standard edition and $99.99 for the Ultimate Edition. Pre-orders begin June 25. Physical copies contain a download code only.',
      content: `<p>Rockstar Games has finally revealed the pricing for Grand Theft Auto VI, and it comes with a significant price hike. The standard edition of GTA 6 will retail for <strong>$79.99</strong>, while the Ultimate Edition will cost <strong>$99.99</strong>.</p>
<p>The $79.99 price point marks a $10 increase over the standard $69.99 AAA game price, following months of speculation that Rockstar might charge $100 for the most anticipated game in history. Analysts had warned that a $100 price tag could limit sales, and the $79.99 compromise appears to balance revenue with accessibility.</p>
<h2>Ultimate Edition Content</h2>
<p>The $99.99 Ultimate Edition includes:</p>
<ul>
<li>Exclusive additional outfits and hairstyles for Jason and Lucia</li>
<li>Makeup, tattoos, and custom nails for Lucia</li>
<li>Classic Vice City '55 Vapid Stanier car</li>
<li>Shore Court personal garage with exclusive car mod shops</li>
<li>Exclusive weapon patterns</li>
<li>Additional open-world activities</li>
</ul>
<h2>Vintage Vice City Pack (Pre-Order Bonus)</h2>
<p>All players who pre-order GTA 6 before launch will receive the Vintage Vice City Pack, featuring clothing and hairstyles inspired by the 1980s neon aesthetic of Grand Theft Auto: Vice City (2002).</p>
<h2>Physical Edition — No Disc</h2>
<p>Physical copies of GTA 6 will be available in stores beginning November 12, 2026, allowing pre-loading before the game unlocks. However, these physical versions will contain only a download code — no disc is included. This marks a significant shift for the franchise and has sparked debate among collectors.</p>
<p>Pre-orders open on <strong>June 25, 2026</strong> at midnight local time across all platforms.</p>`,
      categoryId: (await prisma.category.findUnique({ where: { slug: 'gta-6' } })).id,
      featuredImage: 'https://upload.wikimedia.org/wikipedia/en/4/46/Grand_Theft_Auto_VI.png',
      author: 'GTA 6 Rewards',
      status: 'published',
      readingTime: 4,
      tags: 'gta-6, pricing, pre-order, ultimate-edition',
      source: 'Rockstar Games',
      sourceUrl: 'https://www.rockstargames.com/VI',
      seoTitle: 'GTA 6 Price $79.99 Standard, $99.99 Ultimate Edition — Pre-Orders June 25',
      seoDesc: 'Grand Theft Auto VI is priced at $79.99 for standard and $99.99 for Ultimate Edition. Pre-orders start June 25. Physical copies are download codes only.',
    },
  });
  console.log('Created price reveal article');
} else {
  console.log('Price reveal article already exists, skipping');
}

// 3. Create article about 63 new screenshots
const screenshotsSlug = 'gta-6-63-new-screenshots-vice-city-characters';
const existingScreenshots = await prisma.article.findUnique({ where: { slug: screenshotsSlug } });
if (!existingScreenshots) {
  await prisma.article.create({
    data: {
      title: 'Rockstar Releases 63 New GTA 6 Screenshots — Jason, Lucia, Vice City & More',
      slug: screenshotsSlug,
      excerpt: 'Rockstar has dropped 63 new Grand Theft Auto VI screenshots alongside the price reveal, showcasing Jason, Lucia, Vice City at night, retro hairstyles, and Ultimate Edition exclusive content.',
      content: `<p>Rockstar Games has released a massive batch of <strong>63 new screenshots</strong> for Grand Theft Auto VI, giving fans their best look yet at the highly anticipated game. The images were unveiled on June 24, 2026 alongside the official price and pre-order details.</p>
<p>The screenshots showcase a wide range of content, including:</p>
<h2>Characters & Customization</h2>
<ul>
<li>Jason and Lucia in various outfits and locations</li>
<li>Retro hairstyles inspired by the 1980s</li>
<li>Makeup, tattoos, and custom nail options for Lucia</li>
<li>Exclusive Ultimate Edition clothing and looks</li>
</ul>
<h2>Vintage Vice City Pack</h2>
<p>The pre-order bonus pack includes the classic '55 Vapid Stanier car, retro clothing, and hairstyles that pay homage to the original Grand Theft Auto: Vice City. The screenshots show Tommy Vercetti-inspired looks and neon-drenched outfits.</p>
<h2>Vice City at Night</h2>
<p>Several screenshots capture Vice City in stunning nighttime lighting, with neon reflections, detailed interiors visible through windows, and impressive ray-traced global illumination. The screenshots were captured entirely in-game on PlayStation 5.</p>
<h2>Ultimate Edition Exclusives</h2>
<p>The $99.99 Ultimate Edition screenshots reveal exclusive car mod shops, the Shore Court personal garage, additional open-world activities, and weapon patterns not available in the standard edition.</p>
<p>GTA 6 launches November 19, 2026 on PlayStation 5 and Xbox Series X|S. Pre-orders begin June 25.</p>`,
      categoryId: (await prisma.category.findUnique({ where: { slug: 'gta-6' } })).id,
      featuredImage: 'https://sm.ign.com/t/ign_nordic/gallery/g/gta-6-vint/gta-6-vintage-vice-city-pack-screenshots_yqdz.1400.jpg',
      author: 'GTA 6 Rewards',
      status: 'published',
      readingTime: 3,
      tags: 'gta-6, screenshots, vice-city, lucia, jason, customization',
      source: 'Rockstar Games',
      sourceUrl: 'https://www.rockstargames.com/VI',
      seoTitle: '63 New GTA 6 Screenshots Reveal Jason, Lucia, Vice City & More',
      seoDesc: 'Rockstar released 63 new Grand Theft Auto VI screenshots showing Jason, Lucia, Vice City, retro hairstyles, and Ultimate Edition exclusive content.',
    },
  });
  console.log('Created screenshots article');
} else {
  console.log('Screenshots article already exists, skipping');
}

// 4. Create article about cover art + Vice City clip
const coverSlug = 'gta-6-cover-art-revealed-vice-city-footage';
const existingCover = await prisma.article.findUnique({ where: { slug: coverSlug } });
if (!existingCover) {
  await prisma.article.create({
    data: {
      title: 'GTA 6 Cover Art Revealed — Vice City Nighttime Footage Hidden on Website',
      slug: coverSlug,
      excerpt: 'Rockstar unveiled the official GTA 6 cover art featuring Jason and Lucia, alongside a stunning nighttime clip of Vice City hidden on the official website.',
      content: `<p>Rockstar Games unveiled the official <strong>Grand Theft Auto VI cover art</strong> on June 18, 2026, featuring protagonists Jason Duval and Lucia Caminos in a dynamic Miami Vice-inspired pose with flamingos, palm trees, and the iconic Vice City skyline in the background.</p>
<p>The cover art reveals the game's final logo treatment and confirms the November 19, 2026 release date. It also confirms that GTA 6 will bear the "Grand Theft Auto VI" title without any subtitle.</p>
<h2>Hidden Vice City Nighttime Clip</h2>
<p>Alongside the cover art, Rockstar quietly added a new video clip to the GTA 6 website that fans discovered. The footage shows a slow pan across Vice City at night, revealing:</p>
<ul>
<li>A bustling dock area with skyscrapers illuminated against the night sky</li>
<li>Various boats and a Ferris wheel along the waterfront</li>
<li>Multiple airplanes flying overhead</li>
<li>Ray-traced global illumination lighting</li>
<li>Visible interiors in buildings — a first for the GTA series</li>
</ul>
<p>The 4K 30 FPS clip is believed to be running on PlayStation 5 Pro or Xbox Series X hardware. Some fans noted that the Ferris wheel lacks a reflection in the water, suggesting ray-traced reflections may have distance limitations in the current build.</p>
<h2>The Cover Art</h2>
<p>The cover art features Lucia prominently in the foreground with Jason behind her, set against a pink-and-purple Vice City sunset. The GTA VI logo is rendered in neon pink and yellow. The cover also teases various location landmarks, establishing GTA 6's Florida-inspired setting.</p>
<p>GTA 6 releases November 19, 2026 on PS5 and Xbox Series X|S. Pre-orders start June 25.</p>`,
      categoryId: (await prisma.category.findUnique({ where: { slug: 'gta-6' } })).id,
      featuredImage: 'https://upload.wikimedia.org/wikipedia/en/4/46/Grand_Theft_Auto_VI.png',
      author: 'GTA 6 Rewards',
      status: 'published',
      readingTime: 4,
      tags: 'gta-6, cover-art, vice-city, nighttime, ray-tracing',
      source: 'Rockstar Games',
      sourceUrl: 'https://www.rockstargames.com/VI',
      seoTitle: 'GTA 6 Cover Art Revealed — Vice City Nighttime Footage Hidden on Official Site',
      seoDesc: 'Rockstar reveals GTA 6 cover art featuring Jason and Lucia. Hidden Vice City nighttime footage found on official website showing ray-traced lighting.',
    },
  });
  console.log('Created cover art article');
} else {
  console.log('Cover art article already exists, skipping');
}

await prisma.$disconnect();
console.log('\nAll content updated successfully!');
