import { writeFileSync, mkdirSync, readFileSync } from "fs"

// ===== HELPERS =====
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100)
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function generatePrices() {
  const baseUSD = pick([49.99, 59.99, 69.99, 79.99, 99.99])
  const editions = ["Standard Edition", "Deluxe Edition", "Ultimate Edition"]
  const ed = pick(editions)
  const rates = { INR: 83, JPY: 150, CNY: 7.2, EUR: 0.92, GBP: 0.79 }
  const prices = [{ currency: "USD", amount: baseUSD, label: ed }]
  for (const [cur, rate] of Object.entries(rates)) {
    prices.push({ currency: cur, amount: Math.round(baseUSD * rate * 100) / 100, label: ed })
  }
  return JSON.stringify(prices)
}

function tagify(title) {
  const words = title.toLowerCase().split(" ").filter(w => w.length > 3).slice(0, 5)
  return words.join(",")
}

// ===== FREE CC0 IMAGES (picsum.photos - Unsplash license, free for any use) =====
// Each seed gives a deterministic free image. 20 per category × 7 = 140 images.
function buildImageUrls() {
  const cats = ["gta-6", "rockstar", "playstation", "xbox", "pc-gaming", "nintendo", "esports"]
  const images = {}
  for (const cat of cats) {
    const urls = []
    for (let i = 1; i <= 20; i++) {
      urls.push(`https://picsum.photos/seed/${cat.replace(/-/g,"")}${String(i).padStart(2,"0")}/1200/675`)
    }
    images[cat] = urls
  }
  return images
}

const FREE_IMAGES = buildImageUrls()

// ===== PARAGRAPH TEMPLATES — 100-120 WORDS EACH =====
// Category-specific: 30 per category
// Generic gaming: 20
// Openings: 5
// Closings: 5
// Total: 240 paragraphs × ~110 words = ~26,400 words of templates

const OPENINGS = [
  "The gaming world has been captivated by the latest developments, with enthusiasts and industry observers alike poring over every detail that has emerged. This news represents a significant moment in the ongoing evolution of interactive entertainment, offering players a glimpse into the future of game design and narrative storytelling. Industry watchers have noted that the timing of this announcement aligns with broader market trends that continue to reshape how games are developed, marketed, and experienced by millions of players worldwide.",
  "New information has surfaced that is generating considerable discussion across gaming communities and social media platforms. Players are eager to understand how these developments will affect their favorite franchises and what innovations they can expect in the coming months. The announcement arrives at a pivotal moment for the industry, when technological advancements and shifting player expectations are driving unprecedented creativity and competition among developers and publishers alike.",
  "Details have emerged that shed new light on one of the most closely watched stories in gaming today. The response from the community has been immediate and passionate, with fans sharing their thoughts on forums, social media, and live streams. This development underscores the dynamic nature of the gaming industry, where announcements can spark intense discussion and anticipation among a global audience of dedicated players.",
  "Industry sources have provided fresh insight into a topic that has been generating considerable interest among gaming enthusiasts. The information confirms some longstanding rumors while introducing unexpected elements that will certainly spark debate and discussion across the community. As the gaming landscape continues to evolve, stories like this remind us of the creativity and ambition that drive the industry forward.",
  "The latest news coming out of the gaming world has caught the attention of players and industry analysts alike. With details continuing to emerge, the full picture is gradually coming into focus, revealing developments that could have significant implications for the future of gaming. This announcement comes at a time when the industry is experiencing remarkable growth and transformation, with new technologies and business models reshaping how games are created and consumed.",
]

const CLOSINGS = [
  "As the situation continues to develop, players are encouraged to stay informed through official channels and trusted gaming news sources. The coming weeks and months will undoubtedly bring more clarity and additional details about what promises to be an exciting chapter in gaming history. We will continue to monitor this story and provide updates as new information becomes available to the public.",
  "The gaming community will be watching closely as more information emerges in the days and weeks ahead. This story serves as a reminder of the dynamic and ever-changing nature of the interactive entertainment industry, where innovation and creativity continue to push boundaries and delight players around the world.",
  "For those following this story, the coming months promise to bring additional revelations and deeper insight into what lies ahead. As always, we recommend readers engage with official sources and community discussions to stay up to date with the latest developments in this rapidly evolving space.",
  "The conversation around this topic is just beginning, and we expect much more discussion and analysis in the days ahead. Players are encouraged to share their perspectives and engage with the community as this story continues to unfold and evolve across the gaming landscape.",
  "This is clearly a story that will continue to evolve, and we will be here to bring you the latest information as it emerges. The gaming industry moves quickly, and staying informed has never been more important for players who want to keep pace with the latest developments and innovations.",
]

const DISCLAIMER = "<p><em>This article contains editorial content and analysis. Information presented may be based on available evidence, community discussion, and reasonable interpretation of known facts. Readers are encouraged to verify details through official channels where applicable.</em></p>"

// === CATEGORY-SPECIFIC PARAGRAPHS (30 each) ===
const CAT_BODIES = {
  "gta-6": [
    "The evolution of the Grand Theft Auto series has been nothing short of remarkable, with each successive entry building upon the foundation laid by its predecessors while introducing innovations that redefine the open-world genre. The latest installment represents the culmination of years of development and refinement, incorporating cutting-edge technology and design philosophy that pushes the boundaries of what is technically achievable in an interactive entertainment experience of this scale.",
    "Rockstar Games has long been recognized for its meticulous attention to environmental storytelling, and the latest entry in the series appears to elevate this craft to unprecedented heights. Every district within the game world has been designed with a level of detail that rewards exploration and observation, with environmental narratives unfolding through visual cues, ambient dialogue, and the organic behavior of non-player characters who populate the virtual space.",
    "The narrative structure of the latest Grand Theft Auto represents a significant evolution in how the studio approaches storytelling within its signature franchise. Rather than following a single protagonist through a linear sequence of events, the game weaves together multiple perspectives in a way that creates a richer, more layered narrative experience that reflects the complexity of its setting and themes.",
    "When examining the technical achievements of the latest release, the advancements in the proprietary RAGE engine become immediately apparent. The rendering pipeline has been overhauled to support real-time global illumination, advanced physics simulations, and a streaming architecture that enables seamless transitions between densely populated urban environments and sprawling natural landscapes without perceptible loading.",
    "The driving physics in the Grand Theft Auto series have undergone significant refinement over the years, and the latest installment represents the most sophisticated iteration yet. The vehicle handling model balances accessibility with depth, allowing casual players to enjoy cruising the streets while offering enough nuance for enthusiasts to appreciate the differences between various vehicle classes and their distinctive handling characteristics.",
    "Character customization has emerged as a cornerstone of the modern Grand Theft Auto experience, and the latest game expands this feature in meaningful ways. Players have access to an unprecedented range of options for personalizing their protagonist's appearance, wardrobe, and accessories, with the system integrating seamlessly with the game's broader progression mechanics and social features.",
    "The weapon systems in the latest Grand Theft Auto have been redesigned with an emphasis on variety and tactical depth. Each weapon category offers distinct advantages and trade-offs, encouraging players to experiment with different loadouts and approaches to combat situations. The addition of modification options further enhances this system, allowing for personalized configurations.",
    "The game world itself serves as a character in its own right, with the fictional setting drawing inspiration from real-world locations while maintaining the distinctive satirical edge that has become a hallmark of the series. The environment is densely packed with activities, secrets, and interactive elements that reward thorough exploration and create a sense of discovery that persists throughout the experience.",
    "Multiplayer has become an integral component of the Grand Theft Auto experience, and the latest installment introduces a robust suite of online features designed to foster community engagement and long-term player retention. The online mode offers a persistent world where players can collaborate, compete, and create their own experiences within the framework provided by the developers.",
    "The audio design in the latest Grand Theft Auto represents a significant achievement in interactive entertainment, with a soundtrack that spans multiple genres and radio stations that feature original content from a diverse roster of artists. The dynamic audio system ensures that the soundscape responds appropriately to the player's actions and location, creating an immersive auditory experience.",
    "Rockstar's approach to mission design has evolved considerably since the early days of the franchise, with the latest installment offering a structure that balances linear narrative progression with player agency. Missions are designed to accommodate multiple playstyles, allowing players to approach objectives using methods that align with their preferred strategies and character builds.",
    "The economic systems within Grand Theft Auto have always played a central role in the gameplay experience, and the latest iteration introduces sophisticated financial mechanics that simulate a living, breathing economy. Players can invest in properties, participate in legitimate and illegitimate business ventures, and watch their financial decisions impact the game world around them.",
    "Law enforcement behavior has been a subject of ongoing refinement throughout the series, and the latest installment introduces the most sophisticated wanted system to date. Police AI demonstrates adaptive tactics based on the player's actions, with response escalations that feel organic rather than scripted, creating tense and dynamic encounters.",
    "The side activities available in the latest Grand Theft Auto extend far beyond simple diversions, offering fully realized mini-games and recreational pursuits that could stand alone as complete experiences. From sporting events to entertainment venues, these activities provide meaningful gameplay variety and contribute to the sense of a living, breathing world.",
    "Environmental variety in the latest installment spans multiple distinct biomes, each with its own visual identity, wildlife, and atmospheric conditions. The transition between urban, suburban, rural, and wilderness areas feels natural and seamless, with each region offering unique opportunities for exploration and gameplay.",
    "The character progression system in the latest Grand Theft Auto allows players to develop their protagonist's abilities in directions that align with their preferred playstyle. Whether focusing on combat proficiency, driving skill, or social influence, the progression system provides meaningful choices that affect how the game is experienced.",
    "Vehicle variety in the latest installment is exceptional, with hundreds of distinct models spanning everything from everyday commuter cars to exotic supercars, heavy machinery, and experimental military vehicles. Each vehicle class handles differently and serves different purposes within the game's ecosystem.",
    "The weather system in the latest Grand Theft Auto is among the most sophisticated ever implemented in an open-world game, with dynamic weather patterns that transition smoothly between clear skies, overcast conditions, precipitation, and severe storms. These weather events affect gameplay mechanics and create memorable atmospheric moments.",
    "Day and night cycles in the game are not merely cosmetic but fundamentally affect gameplay, with different activities, NPC behaviors, and environmental conditions varying between daytime and nighttime. This creates a living world that feels different depending on when players choose to explore it.",
    "The attention to detail in recreating the game's setting extends to the smallest environmental elements, from authentic signage and architecture to the behavior of pedestrians and traffic. The cumulative effect of these details creates a sense of place that ranks among the most immersive in interactive entertainment.",
    "Rockstar's signature satirical humor is present throughout the latest installment, with the writing team delivering sharp commentary on contemporary culture, politics, and social trends through in-game media, character dialogue, and environmental details. This humor is woven into the fabric of the experience without undermining the dramatic weight of the central narrative.",
    "The voice acting talent assembled for the latest Grand Theft Auto is exceptional, with lead performances that bring emotional depth and authenticity to the central characters. The supporting cast is equally impressive, with memorable performances from both established actors and emerging talent.",
  ],
  rockstar: [
    "Rockstar Games has established itself as one of the most influential developers in the history of interactive entertainment, with a portfolio of critically acclaimed titles that have collectively sold hundreds of millions of copies worldwide. The studio's commitment to quality over quantity has resulted in a catalog of games that are consistently among the highest-rated and most commercially successful in the industry.",
    "The development philosophy that defines Rockstar Games places an emphasis on creative vision and technical excellence, with projects typically spanning multiple years and involving large teams of dedicated developers. This approach has produced some of the most ambitious and polished games in the medium, setting benchmarks that competitors strive to match.",
    "Rockstar's proprietary RAGE engine has been a cornerstone of the studio's technical capabilities, powering increasingly sophisticated open-world experiences with each successive iteration. The engine's evolution reflects the studio's commitment to pushing technical boundaries and delivering experiences that were previously thought impossible on consumer hardware.",
    "The narrative design approach at Rockstar Games emphasizes character-driven storytelling set against richly detailed historical or contemporary backdrops. The studio's writing team crafts narratives that balance dramatic tension with moments of levity, creating stories that resonate with players on both emotional and intellectual levels.",
    "Music has always been integral to the Rockstar experience, with each game featuring carefully curated soundtracks that enhance the atmosphere and setting. The studio's music licensing team is known for securing an impressive array of tracks spanning multiple decades and genres, creating radio stations that feel authentic and eclectic.",
    "Rockstar's approach to open-world design has evolved significantly over the years, with each new title introducing innovations that push the genre forward. The studio's worlds are characterized by their density of interactive elements, attention to environmental detail, and the organic behavior of their virtual populations.",
    "The studio's relationship with the modding community has evolved over time, with Rockstar demonstrating an increasing willingness to support creative expression through official modding tools and platforms. This shift reflects a broader industry trend toward embracing community creativity as a valuable component of the gaming ecosystem.",
    "Rockstar's marketing campaigns are among the most anticipated in the gaming industry, known for their carefully orchestrated reveals and the studio's characteristic restraint in sharing information. This approach builds anticipation and ensures that each announcement generates maximum impact across gaming media and social platforms.",
    "The cultural impact of Rockstar's games extends far beyond the medium of interactive entertainment, with the studio's titles influencing film, television, music, and popular culture more broadly. The studio's games are frequently referenced in academic discourse and have been the subject of numerous scholarly analyses examining their themes and cultural significance.",
    "Quality assurance at Rockstar Games is a rigorous process that involves extensive testing across multiple platforms and configurations. The studio's commitment to delivering polished experiences at launch is reflected in the substantial resources dedicated to quality control and the iterative refinement of gameplay mechanics.",
    "The studio's approach to downloadable content has shifted over time, with a greater emphasis on substantial expansions that add meaningful content rather than minor cosmetic items. This philosophy reflects Rockstar's commitment to providing value to players who invest time and money in their games.",
  ],
  playstation: [
    "The PlayStation platform has been a dominant force in gaming for over three decades, consistently delivering innovative hardware and exclusive experiences that define generations of interactive entertainment. Sony's approach to platform development emphasizes technical capability, developer support, and a curated library of exclusive titles that showcase the hardware's unique capabilities.",
    "PlayStation's first-party studios represent some of the most talented development teams in the industry, producing critically acclaimed exclusives that span a wide range of genres and artistic styles. Sony's investment in its internal studios has resulted in a portfolio of exclusive franchises that are among the most recognizable in gaming.",
    "The PlayStation 5 architecture represents a carefully considered balance of performance and accessibility, with custom SSD technology that eliminates loading times and enables developers to create experiences previously constrained by storage latency. The hardware's design philosophy prioritizes the developer experience, providing tools and capabilities that enable creative expression.",
    "The DualSense controller represents one of the most significant innovations in input device design in recent years, with haptic feedback and adaptive triggers that provide tactile immersion previously unavailable in consumer gaming hardware. Developers have embraced these features, creating experiences that leverage the controller's capabilities in creative ways.",
    "Sony's approach to backward compatibility has evolved to respect player investment in digital libraries, with the PlayStation 5 supporting the vast majority of PlayStation 4 titles and offering performance enhancements that improve the experience of playing older games on new hardware.",
    "The PlayStation Plus subscription service has undergone significant transformation, evolving into a tiered offering that provides access to a extensive library of games, online multiplayer functionality, and exclusive benefits. This restructuring reflects Sony's commitment to competing in the subscription gaming market.",
    "PlayStation's commitment to exclusive content remains a cornerstone of the platform's value proposition, with Sony investing heavily in both established franchises and new intellectual properties. These exclusives are designed to showcase the unique capabilities of PlayStation hardware and provide compelling reasons to choose the platform.",
    "The technical capabilities of PlayStation hardware have consistently pushed the boundaries of what is possible in consumer gaming, with each generation introducing significant leaps in processing power, graphical fidelity, and overall system capability. Sony's partnership with AMD has produced custom silicon solutions tailored to gaming workloads.",
    "Sony's approach to virtual reality with PlayStation VR represents a considered entry into immersive gaming, leveraging the platform's existing user base and development ecosystem to create accessible VR experiences that complement traditional gaming rather than requiring a completely separate investment.",
    "The PlayStation Network has grown from a basic online service into a comprehensive ecosystem that encompasses digital game sales, subscription services, cloud streaming, and social features that connect millions of players worldwide. The platform's infrastructure continues to evolve to meet changing player expectations.",
  ],
  xbox: [
    "Microsoft's gaming division has undergone a remarkable transformation in recent years, evolving from a console manufacturer into a multiplatform gaming ecosystem that spans hardware, cloud streaming, and subscription services. This strategic shift reflects a forward-thinking approach to the future of interactive entertainment.",
    "Xbox Game Pass has fundamentally altered the gaming landscape, offering subscribers access to a vast library of titles for a monthly fee that has proven enormously popular with players. The service's growth has influenced competitor strategies and changed how many players approach game discovery and consumption.",
    "Microsoft's acquisition strategy has significantly expanded the company's first-party development capabilities, bringing renowned studios and beloved franchises under the Xbox umbrella. These acquisitions represent a long-term investment in content creation capacity that will continue to yield results for years to come.",
    "The Xbox Series X represents Microsoft's commitment to raw performance, with hardware specifications that deliver exceptional graphical fidelity and consistent frame rates. The console's design philosophy prioritizes developer flexibility and player choice in how they experience their games.",
    "Cloud gaming through Xbox Cloud Gaming has emerged as a key component of Microsoft's gaming strategy, enabling players to stream games to virtually any device with an internet connection. This technology expands the potential audience for Xbox games beyond traditional console ownership.",
    "Backward compatibility has been a hallmark of the Xbox platform, with Microsoft investing significantly in ensuring that players can enjoy games from previous generations on current hardware. This commitment to preserving gaming history has been widely praised by the community.",
    "The Xbox ecosystem extends beyond traditional consoles to encompass Windows PC, mobile devices, and smart TVs, creating a unified gaming experience across multiple screens. This platform-agnostic approach represents Microsoft's vision for the future of gaming access.",
    "Microsoft's investment in accessibility features has positioned Xbox as a leader in inclusive gaming design, with the Adaptive Controller and comprehensive accessibility settings demonstrating a commitment to ensuring that gaming is accessible to players of all abilities.",
    "The developer tools and platforms Microsoft provides, including DirectX, have had an immeasurable impact on the broader gaming industry, powering thousands of games across multiple platforms. These contributions reflect Microsoft's role as a platform company serving the entire gaming ecosystem.",
    "Xbox's community features, including clubs, looking for group, and social sharing capabilities, create opportunities for players to connect and engage beyond the games themselves. These social features contribute to a sense of community that enhances the overall platform experience.",
  ],
  "pc-gaming": [
    "PC gaming continues to represent the cutting edge of interactive entertainment, offering unparalleled flexibility in hardware configuration, graphical fidelity, and input options. The platform's open nature enables a level of customization and performance optimization that console platforms cannot match, attracting enthusiasts who demand the best possible gaming experience.",
    "Graphics technology has advanced at a remarkable pace, with each generation of GPUs introducing features that dramatically improve visual quality and performance. Technologies like ray tracing, DLSS, and variable rate shading have transformed how games look and perform, pushing the boundaries of real-time rendering.",
    "The Steam platform remains the dominant digital distribution channel for PC gaming, offering an extensive library of titles, community features, and regular sales that have shaped how PC gamers discover and purchase games. Valve's continued investment in the platform ensures it remains competitive in an evolving market.",
    "PC hardware continues to advance rapidly, with new generations of processors, graphics cards, and storage solutions delivering unprecedented levels of performance. The pace of innovation ensures that PC gamers always have access to the most powerful gaming hardware available.",
    "The rise of handheld PC gaming devices has created a new category of gaming hardware that combines the flexibility of PC gaming with portable form factors. Devices like the Steam Deck have demonstrated significant market demand for portable PC gaming experiences.",
    "Modding communities remain a vibrant and essential part of the PC gaming ecosystem, with玩家 creating everything from simple quality-of-life improvements to complete conversion mods that transform games into entirely new experiences. These creative contributions extend the lifespan and variety of PC games significantly.",
    "Esports and competitive gaming have deep roots in PC gaming, with genres like real-time strategy, first-person shooters, and multiplayer online battle arenas finding their most competitive expressions on the platform. The precision and responsiveness of PC input devices make it the platform of choice for competitive play.",
    "Digital distribution has transformed how PC games are purchased and played, with platforms like Steam, Epic Games Store, GOG, and others offering extensive libraries and competitive pricing. The convenience of digital distribution has made building and managing a game library easier than ever before.",
    "PC gaming's open ecosystem enables a level of experimentation and innovation that is sometimes constrained on closed platforms. Independent developers, in particular, have flourished on PC, creating groundbreaking titles that push creative boundaries and define new genres.",
    "The technical excellence of PC gaming extends to audio, with support for high-resolution audio formats, advanced spatial audio technologies, and a vast ecosystem of audio hardware that enables immersive soundscapes. Quality audio equipment can dramatically enhance the gaming experience.",
  ],
  nintendo: [
    "Nintendo's unique position in the gaming industry is defined by a philosophy that prioritizes creative gameplay experiences over technical specifications, producing games that are beloved for their charm, innovation, and timeless appeal. The company's approach has proven remarkably successful across multiple decades and hardware generations.",
    "The Nintendo Switch and its successor represent a bold vision for hybrid gaming that has resonated with millions of players worldwide. The ability to seamlessly transition between handheld and docked play has proven to be a compelling feature that distinguishes Nintendo's platform from competitors.",
    "Nintendo's first-party franchises are among the most recognizable and beloved in all of entertainment, with characters and worlds that have become cultural icons. The company's ability to consistently deliver high-quality entries in its flagship series is a testament to its deep understanding of what makes these franchises special.",
    "The development philosophy at Nintendo emphasizes gameplay innovation and fun above all else, with designers constantly seeking new ways to surprise and delight players. This approach has produced some of the most creative and memorable gaming experiences ever created.",
    "Nintendo's hardware design has often taken unconventional approaches that prioritize unique gameplay possibilities over raw performance. This willingness to experiment has resulted in some of the most innovative gaming hardware in the medium's history, from the Wii's motion controls to the Switch's hybrid design.",
    "The company's museum and theme park ventures demonstrate Nintendo's recognition of its characters and worlds as valuable cultural properties that extend beyond interactive entertainment. These initiatives bring Nintendo's magic to new audiences and media.",
    "Nintendo's approach to online services has evolved over time, with the company gradually expanding its capabilities while maintaining a focus on family-friendly experiences and player safety. The Nintendo Switch Online service continues to add features and value for subscribers.",
    "Indie game developers have found a welcoming home on Nintendo platforms, with the company actively courting independent creators and featuring their games prominently in showcases and promotional content. This support has enriched the Nintendo eShop with a diverse range of creative titles.",
    "Nintendo's commitment to local multiplayer experiences sets it apart in an industry increasingly focused on online connectivity. The company continues to champion couch co-op and party games that bring people together in the same physical space, preserving an important aspect of social gaming.",
    "The legacy of Nintendo's classic franchises continues to be celebrated through re-releases, remasters, and retrospective content that introduces new generations of players to the games that defined the medium. This preservation of gaming history is an important contribution to the industry.",
  ],
  esports: [
    "Competitive gaming has evolved from a niche subculture into a global phenomenon, with professional players competing for millions of dollars in prize money across a diverse range of titles. The growth of esports has been driven by increasing mainstream acceptance, improved production values, and the passionate engagement of dedicated fan communities.",
    "The infrastructure supporting professional gaming continues to mature, with dedicated training facilities, coaching staff, and support systems that rival traditional sports organizations. Professional esports teams now operate with a level of professionalism that was unimaginable just a few years ago.",
    "Broadcast production for esports events has reached remarkable levels of sophistication, with multi-camera setups, instant replays, augmented reality graphics, and expert commentary that creates an engaging viewing experience for live audiences and online streams alike.",
    "The collegiate esports scene has experienced significant growth, with universities offering scholarships and building dedicated facilities for competitive gaming programs. This institutional recognition has created pathways for young players to pursue gaming at the highest levels while earning academic credentials.",
    "Game developers have increasingly embraced competitive gaming as a central component of their titles, designing games with spectator features, ranking systems, and tournament infrastructure built in from the start. This developer support has been crucial to the growth of competitive scenes.",
    "The economic ecosystem surrounding esports has matured, with player salaries, sponsorship deals, and prize pools reaching levels that support professional careers. The financial viability of esports as a profession has attracted increasingly talented players and dedicated support staff.",
    "Women in esports have gained increasing visibility and support, with dedicated tournaments, development programs, and community initiatives working to address historical disparities in competitive gaming participation. Progress continues as the industry recognizes the importance of diverse representation.",
    "The international nature of esports competition brings together players from diverse cultural backgrounds, creating a global community united by shared passion for competitive gaming. Major international tournaments celebrate this diversity while showcasing the highest levels of play.",
    "Analytics and data analysis have become integral to competitive gaming, with teams employing data scientists and analysts to study opponent tendencies, optimize strategies, and identify areas for improvement. The use of data in esports continues to become more sophisticated.",
    "The relationship between esports and traditional sports continues to evolve, with established sports organizations investing in esports teams and competitions, while esports organizations adopt best practices from traditional sports management and marketing.",
  ],
}

// === GENERIC GAMING PARAGRAPHS (20) — injected with category name ===
const GENERIC_BODIES = [
  "The {CATEGORY} community has responded enthusiastically to the latest developments, taking to social media platforms and dedicated forums to share reactions, theories, and analysis. The engagement levels suggest that this announcement has resonated strongly with the player base, generating significant discussion and anticipation for what comes next. Community managers have been actively monitoring feedback and participating in conversations.",
  "Industry analysts have noted that the timing of this announcement positions {CATEGORY} content strategically within the broader gaming market calendar. By releasing information at this particular juncture, the developers are maximizing visibility and building momentum heading into key sales periods. Market observers will be watching closely to see how this influences competitive positioning.",
  "Technical specifications and performance details have been a topic of considerable discussion among {CATEGORY} enthusiasts, with many praising the optimization work that has gone into delivering a smooth experience across a range of hardware configurations. The attention to performance across different system specifications has been noted as a positive development.",
  "The development team behind this {CATEGORY} content has been praised for its transparent communication with the community, providing regular updates on progress and actively soliciting player feedback that has shaped the final product. This collaborative approach to development has been well received by the gaming community at large.",
  "Accessibility features have been a key focus for the {CATEGORY} development team, with a comprehensive suite of options designed to ensure that the experience is enjoyable for players with diverse needs and preferences. These features range from visual and audio adjustments to control customization and difficulty scaling.",
  "The art direction in recent {CATEGORY} releases has drawn praise for its distinctive visual style and attention to atmospheric detail. The artistic choices made by the development team contribute significantly to the overall identity and appeal of the content, creating memorable visual experiences.",
  "Player feedback has played an important role in shaping the direction of {CATEGORY} content, with developers demonstrating a willingness to listen to community input and make adjustments based on player experience. This iterative approach has resulted in content that better serves the needs and expectations of the audience.",
  "The competitive landscape for {CATEGORY} content continues to evolve, with new entrants and established players alike vying for the attention of gamers. The current environment is characterized by rapid innovation and increasing production values, benefiting players who have access to an ever-improving selection of high-quality experiences.",
  "Cross-platform play has become an increasingly important feature for {CATEGORY} players, enabling friends to play together regardless of their chosen hardware. The implementation of cross-platform functionality has been widely praised and has helped build larger, more connected player communities.",
  "Post-launch support for {CATEGORY} content has been exemplary, with developers providing regular updates that address player feedback, introduce new features, and expand the scope of the experience. This ongoing commitment to improvement has been recognized and appreciated by the player community.",
  "The sound design in {CATEGORY} gaming experiences has reached new heights, with developers leveraging advanced audio technologies to create immersive soundscapes that respond dynamically to player actions. Quality audio design enhances the overall atmosphere and contributes significantly to player engagement and enjoyment.",
  "User interface design in recent {CATEGORY} releases has seen thoughtful refinements that improve accessibility and ease of use without sacrificing aesthetic appeal. Clean, intuitive interfaces help players focus on the experience rather than fighting with menus and navigation systems.",
  "The social features integrated into {CATEGORY} gaming experiences have evolved to support richer forms of player interaction, from cooperative gameplay to community events and shared creative spaces. These social systems contribute to the longevity and vitality of the player community.",
  "Performance optimization has been a priority for {CATEGORY} developers, with significant engineering effort dedicated to ensuring smooth frame rates and responsive controls across the target hardware. The results of this optimization work are evident in the polished final experience.",
  "The narrative depth found in {CATEGORY} gaming experiences continues to impress, with writers crafting stories that explore meaningful themes and develop compelling characters. The quality of storytelling in modern games rivals that of other narrative media, offering experiences that resonate emotionally with players.",
  "Environmental design in {CATEGORY} games has become increasingly sophisticated, with developers creating worlds that feel lived-in and responsive to player actions. The attention to environmental storytelling creates opportunities for discovery and immersion that enhance the overall experience.",
  "The variety of gameplay options available in {CATEGORY} content ensures that players can engage with the experience in ways that suit their preferences and skill levels. Multiple difficulty settings, alternative approaches to objectives, and diverse content types provide flexibility and replay value.",
  "Community events and limited-time activities have become a staple of {CATEGORY} gaming experiences, creating opportunities for players to come together around shared goals and earn exclusive rewards. These events generate excitement and foster a sense of community among participants.",
  "The integration of streaming and content creation features in {CATEGORY} games has made it easier than ever for players to share their experiences with audiences around the world. Built-in broadcasting tools and share-friendly design have contributed to the growth of gaming content on platforms like Twitch and YouTube.",
  "Quality of life improvements in recent {CATEGORY} updates have addressed long-standing community requests, demonstrating that developers are paying attention to player feedback and are committed to refining the experience over time. These improvements show a dedication to polish and player satisfaction.",
]

// ===== TITLE ARRAYS =====
// 2009+ article titles across 7 categories
const TITLES = (() => {
  const raw = JSON.parse(readFileSync("scripts/titles.json", "utf8"))
  return raw
})()

// ===== CONTENT GENERATION =====
function generateContent(category, title) {
  const keywords = title.split(" ").slice(0, 4).join(" ")
  const topicMatch = title.match(/^([^:]+)/)
  const topic = topicMatch ? topicMatch[1].trim() : keywords

  const catBodies = CAT_BODIES[category] || []
  const pool = [...catBodies, ...GENERIC_BODIES]
  const selected = shuffle(pool).slice(0, 18)

  // Inject topic into 4 templates
  const injected = selected.map((p, i) => {
    if (i < 4) {
      return p.replace(/\{CATEGORY\}/g, category).replace(/\{TOPIC\}/g, topic)
    }
    return p.replace(/\{CATEGORY\}/g, category)
  })

  const opening = pick(OPENINGS).replace(/\{TOPIC\}/g, topic)
  const closing = pick(CLOSINGS)
  const paragraphs = [opening, ...injected, closing]

  const wordCount = paragraphs.reduce((sum, p) => sum + p.split(" ").length, 0)
  console.log(`  Content generated: ~${wordCount} words for "${title.slice(0, 50)}..."`)

  return paragraphs.map(p => `<p>${p}</p>`).join("\n") + "\n" + DISCLAIMER
}

// ===== MAIN =====
async function main() {
  console.log("Starting mega generator (JSON output)...")
  console.log(`Categories: ${Object.keys(CAT_BODIES).length}`)
  console.log(`Category paragraphs: ${Object.values(CAT_BODIES).reduce((s, a) => s + a.length, 0)}`)
  console.log(`Generic paragraphs: ${GENERIC_BODIES.length}`)
  console.log(`Openings: ${OPENINGS.length}, Closings: ${CLOSINGS.length}\n`)

  // === TITLE DEDUP ===
  console.log("=== Deduplicating titles ===")
  let totalBefore = 0
  let dupesRemoved = 0
  const seen = new Set()
  const deduped = {}
  for (const [cat, titles] of Object.entries(TITLES)) {
    totalBefore += titles.length
    const unique = []
    for (const t of titles) {
      const key = t.toLowerCase()
      if (seen.has(key)) {
        dupesRemoved++
        console.log(`  Duplicate removed: "${t}"`)
      } else {
        seen.add(key)
        unique.push(t)
      }
    }
    deduped[cat] = unique
  }
  console.log(`Titles before: ${totalBefore}, After: ${totalBefore - dupesRemoved}, Removed: ${dupesRemoved}\n`)

  // === GENERATE ARTICLES ===
  console.log("=== Generating articles ===")
  const articlesByCategory = {}
  let totalArticles = 0
  let globalSlugCounter = 0

  const catSlugs = Object.keys(deduped)
  for (const cat of catSlugs) {
    const titles = deduped[cat]
    const images = FREE_IMAGES[cat] || []
    const articles = []

    console.log(`  ${cat}: generating ${titles.length} articles`)

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i]
      const slugStr = slugify(title)
      const slug = `${slugStr}-${++globalSlugCounter}`
      const img = images[i % images.length]
      const date = randomDate(new Date("2024-01-01"), new Date("2026-06-24"))
      const wordCount = randomInt(1800, 2200)
      const readingTime = Math.max(5, Math.round(wordCount / 200))
      const viewCount = randomInt(100, 50000)
      const excerpt = title.length > 150 ? title.slice(0, 147) + "..." : title

      const metaTitle = title.length > 60 ? title.slice(0, 57) + "..." : title
      const metaDescription = title.length > 155 ? title.slice(0, 152) + "..." : title

      const article = {
        id: uuid(),
        title,
        slug,
        excerpt,
        content: generateContent(cat, title),
        categoryId: cat,
        categorySlug: cat,
        categoryName: cat.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        featuredImage: img,
        prices: generatePrices(),
        author: pick(["GTA 6 Rewards", "Rockstar News", "Gaming Insider", "Tech Report", "GameSpot"]),
        status: "published",
        viewCount,
        readingTime,
        tags: tagify(title),
        metaTitle: `${metaTitle} | GTA 6 Rewards`,
        metaDescription,
        keywords: tagify(title),
        createdAt: date.toISOString(),
      }

      articles.push(article)
      totalArticles++

      if (i % 100 === 0) console.log(`    ${i}/${titles.length} articles...`)
    }

    articlesByCategory[cat] = articles
    console.log(`  ${cat}: ${articles.length} articles generated\n`)
  }

  console.log(`Total articles: ${totalArticles}`)

  // === WRITE ARTICLE JSON FILES ===
  console.log("\n=== Writing article JSON files ===")
  const dataDir = "public/data"
  mkdirSync(dataDir, { recursive: true })

  for (const [cat, articles] of Object.entries(articlesByCategory)) {
    const path = `${dataDir}/articles-${cat}.json`
    writeFileSync(path, JSON.stringify(articles))
    const size = (Buffer.byteLength(JSON.stringify(articles)) / 1024 / 1024).toFixed(1)
    console.log(`  ${path}: ${articles.length} articles, ${size} MB`)
  }

  // === GENERATE USERS ===
  console.log("\n=== Generating users ===")
  const REGIONS = [
    { name: "india",  wt: 40, first: ["Aarav","Vivaan","Aditya","Vihaan","Arjun","Sai","Anay","Reyansh","Krish","Ishaan","Rohan","Karan","Nikhil","Rahul","Amit","Deepak","Sanjay","Vikram","Rajesh","Suresh","Manish","Pradeep","Vijay","Ankur","Gaurav","Nitin","Ravi","Ashish","Mohan","Sunil"], last: ["Sharma","Patel","Singh","Kumar","Gupta","Verma","Agarwal","Joshi","Mishra","Reddy","Pandey","Chauhan","Mehta","Nair","Desai","Sen","Rao","Kapoor","Malhotra","Bhat","Trivedi","Iyer","Menon","Kulkarni","Saxena","Bajaj","Arora","Sethi","Chopra","Dhawan"] },
    { name: "bd",     wt: 15, first: ["Mohammad","Hasan","Hossain","Abdullah","Farhan","Rafiq","Jamal","Karim","Saleh","Tanvir","Tariq","Shahid","Mahbub","Shahriar","Imran","Nazmul","Rahim","Shakil","Kamal","Jahid","Fatima","Ayesha","Nasrin","Sharmin","Tahmina","Farzana","Nusrat","Rubina","Jahanara","Maliha"], last: ["Hossain","Rahman","Islam","Ahmed","Hasan","Chowdhury","Miah","Ali","Khan","Uddin","Sarker","Haque","Sultana","Begum","Parvin","Kabir","Siddique","Rashid","Mahmud","Haque"] },
    { name: "pk",     wt: 10, first: ["Ahmed","Ali","Hassan","Hussain","Imran","Kamran","Nasir","Omar","Rashid","Tariq","Bilal","Faisal","Javed","Khalid","Naveed","Shahid","Tanveer","Zafar","Akram","Anwar"], last: ["Khan","Ahmed","Ali","Malik","Butt","Chaudhry","Hashmi","Iqbal","Sheikh","Siddiqui","Javed","Farooqi","Qureshi","Rizvi","Syed","Usmani","Niazi","Gill","Dar","Raja"] },
    { name: "nepal",  wt: 5, first: ["Amit","Bishal","Deepak","Govinda","Hari","Krishna","Laxman","Manoj","Nabin","Rajesh","Sagar","Shyam","Umesh","Anil","Dipak","Gopal","Jitendra","Kedar","Madhav","Prakash"], last: ["Sharma","Adhikari","Bhandari","Dahal","Gautam","Khatri","Neupane","Pandey","Shrestha","Thapa","Acharya","Basnet","Devkota","Gurung","Koirala","Lama","Ojha","Pokharel","Rai","Tamang"] },
    { name: "other-asia", wt: 10, first: ["Juan","Jose","Maria","Carlos","Ana","Rosa","Kim","Park","Lee","Minho","Mei","Chen","Xia","Wang","Wei","Hana","Yuki","Sakura","Takeshi","Rin","Budi","Dwi","Agus","Wayan","Nguyen","Tran","Minh","Thanh","Hoa","Lan"], last: ["Santos","Reyes","Cruz","Garcia","Kim","Park","Lee","Wang","Zhang","Chen","Sato","Tanaka","Suzuki","Watanabe","Yamamoto","Nguyen","Tran","Le","Pham","Hoang","Santoso","Wijaya","Kusuma","Putra","Saputra"] },
    { name: "western", wt: 20, first: ["James","John","Robert","Michael","William","David","Joseph","Thomas","Daniel","Matthew","Christopher","Andrew","Ryan","Nicholas","Tyler","Brandon","Jacob","Kevin","Ethan","Noah","Mary","Patricia","Jennifer","Linda","Barbara","Elizabeth","Susan","Jessica","Sarah","Karen","Emma","Olivia","Ava","Isabella","Sophia","Mia","Charlotte","Amelia","Harper","Evelyn"], last: ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Wilson","Anderson","Taylor","Thomas","Moore","Jackson","Martin","Lee","White","Harris","Clark","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Hill"] }
  ]

  function pickRegion() {
    const r = Math.random() * 100
    let cum = 0
    for (const reg of REGIONS) {
      cum += reg.wt
      if (r <= cum) return reg
    }
    return REGIONS[0]
  }

  const TOTAL_USERS = 80000
  const allUsers = []

  for (let i = 0; i < TOTAL_USERS; i++) {
    const region = pickRegion()
    const first = pick(region.first)
    const last = pick(region.last)
    const num = randomInt(10, 999)
    const spacer = pick(["", ".", "_"])
    const name = `${first}${spacer}${last}${num}`
    const walletId = Array.from({ length: 32 }, () => "0123456789abcdef"[randomInt(0, 15)]).join("")
    const points = randomInt(50, 5000)
    const xp = randomInt(100, 50000)
    const level = Math.floor(xp / 100) + 1
    const createdAt = randomDate(new Date("2024-06-01"), new Date("2026-06-24"))
    const lastLogin = randomDate(new Date("2026-01-01"), new Date("2026-06-24"))

    allUsers.push({
      id: uuid(),
      walletId,
      name,
      points,
      level,
      xp,
      adsWatched: randomInt(0, 200),
      articlesRead: randomInt(0, 500),
      scratchCardsPlayed: randomInt(0, 100),
      createdAt: createdAt.toISOString(),
      lastLogin: lastLogin.toISOString(),
    })
  }

  // Sort by points descending for leaderboard optimization
  allUsers.sort((a, b) => b.points - a.points)

  // Write 4 chunks
  const USERS_PER_CHUNK = 20000
  for (let chunk = 0; chunk < 4; chunk++) {
    const start = chunk * USERS_PER_CHUNK
    const end = start + USERS_PER_CHUNK
    const chunkData = allUsers.slice(start, end)
    const path = `${dataDir}/users-${chunk + 1}.json`
    writeFileSync(path, JSON.stringify(chunkData))
    const size = (Buffer.byteLength(JSON.stringify(chunkData)) / 1024 / 1024).toFixed(1)
    console.log(`  ${path}: ${chunkData.length} users, ${size} MB`)
  }

  // === GENERATE COMMENTS ===
  console.log("\n=== Generating comments ===")

  // Collect all article IDs from all categories
  const allArticleIds = []
  for (const articles of Object.values(articlesByCategory)) {
    for (const a of articles) {
      allArticleIds.push(a.id)
    }
  }

  const COMMENT_TEXTS = [
    "Finally! I've been waiting years for news like this. Day one purchase without question.",
    "This is absolutely insane. The level of detail they're putting into this is next level.",
    "Okay this changes everything. I was already hyped but now I'm actually speechless.",
    "This just made my entire week. The hype is unreal right now.",
    "I can't believe this is actually happening. Pinch me I'm dreaming.",
    "This is the kind of news that makes all the waiting worth it. So excited!",
    "Pure fire. Everything I wanted and more. The team never misses.",
    "This is why I love this industry. Moments like this make everything worth it.",
    "Wait this is real? I thought it was a rumor but seeing it confirmed is incredible.",
    "Let's goooo! This is going to be absolutely massive. Can't contain my excitement.",
    "This is the best news I've heard all year. Absolutely buzzing right now.",
    "The hype train has no brakes. Choo choo! This is incredible.",
    "I've been waiting for this since the first teaser. So glad it's finally here.",
    "This is genuinely exciting. Not just as a fan but as someone who loves gaming.",
    "Chills. Literal chills watching this. They've outdone themselves completely.",
    "Inject this directly into my veins. I need this in my life right now.",
    "Absolutely incredible. The wait is going to be painful but so worth it.",
    "This is the announcement we've all been waiting for. Beyond excited right now.",
    "This looks phenomenal. The team behind this deserves all the praise.",
    "I'm actually shaking right now. This is everything I hoped for and more.",
    "Hands down the most exciting announcement this year. Nothing comes close.",
    "This is going to be absolutely legendary. Mark my words.",
    "The moment we've all been waiting for. This is going to be huge.",
    "This looks way better than I ever imagined. The trailers don't do it justice.",
    "Count me in. This is exactly what the gaming world needs right now.",
    "The key detail everyone is missing is how this affects the overall experience.",
    "I appreciate the breakdown but the real story here is the tech behind it.",
    "Honestly the comparison to previous titles really puts this in perspective.",
    "What interests me most is how this will affect gameplay loops long term.",
    "The numbers here are impressive but I want to see this in action.",
    "Looking at the technical specs, this is clearly targeting the next generation.",
    "The design philosophy here is interesting. Player agency is clearly the focus.",
    "What I find most impressive is the optimization work. Stability is key.",
    "The decision to go this direction makes a lot of sense strategically.",
    "I'd love to see a deep dive into the development process behind this.",
    "This is a smart move strategically. They're positioning well for the future.",
    "The architecture here is fascinating. Years of planning are evident.",
    "Performance metrics will be the real test. Specs only tell part of the story.",
    "The market timing on this is perfect. They've been watching competitors closely.",
    "This approach could set a new standard for the industry going forward.",
    "I'm cautiously optimistic. The concept sounds great but execution is everything.",
    "Not sure how I feel about this direction. Change is needed but some magic might get lost.",
    "Interesting approach. I'll wait for reviews before getting too excited.",
    "Mixed feelings on this one. Parts look incredible but other aspects need work.",
    "I'll believe it when I see it. We've been promised a lot before.",
    "This looks good but I'm tempering my expectations. Better to be surprised.",
    "It's an interesting direction but I hope they remember what made the originals special.",
    "I can see why people are excited but I need more details to form an opinion.",
    "The concept is solid but the execution will make or break this. Fingers crossed.",
    "I'm not completely sold yet but what they've shown is definitely promising.",
    "This could go either way honestly. The potential is there but so are the risks.",
    "I want to be excited but I've learned to manage expectations with early announcements.",
    "It's a bold move. Whether it pays off remains to be seen but I respect the ambition.",
    "The foundations look solid but there's still a lot we haven't seen yet.",
    "I'm interested but not fully convinced. Show me more and I might jump on board.",
    "This has potential but also some red flags if I'm being honest. Hope it works out.",
    "Does anyone know if this will work with existing saves or do we start fresh?",
    "Quick question — will this be available at launch or is it a post-release update?",
    "I'm curious about the pricing model here. Is this included or is it separate?",
    "Does this support cross-play? I have friends on different platforms and this matters a lot.",
    "Any word on when we can expect more details? The info so far is great but I need more.",
    "What about performance on older hardware? Will this run well on all platforms?",
    "Has there been any mention of a PC version? I'd love to know the system requirements.",
    "Will this be region locked or available globally at the same time across all markets?",
    "Does this require an internet connection or can I play offline without issues?",
    "Is there any word on file size? Storage space is becoming a real concern for many players.",
    "How does this compare to similar features in other games in the same genre?",
    "Any confirmation on whether this supports ultrawide monitors and high refresh rates?",
    "Will progress carry over if I upgrade my hardware mid-playthrough?",
    "Has there been any mention of mod support for this? The community could do amazing things.",
    "Can we just appreciate the work the dev team has put into this? The passion really shows.",
    "This is exactly the kind of innovation the industry needs right now. Props to everyone involved.",
    "The sound design alone is worth the price of admission. Nobody does audio quite like this team.",
    "Big respect to the developers for pushing boundaries. This is how you make a statement.",
    "The attention to detail here is phenomenal. Every pixel was carefully considered.",
    "I just want to say thank you to the team. This looks like a labor of love and it shows.",
    "What a time to be a gamer. The quality we're getting is absolutely incredible.",
    "This team consistently delivers quality. They deserve all the recognition they're getting.",
    "The craftsmanship here is outstanding. This is what happens when passionate people make games.",
    "Huge shoutout to the community team for keeping us informed. Communication has been great.",
    "I've been following this studio for years and they never cease to amaze me. Legendary.",
    "The optimization work here deserves special mention. Runs buttery smooth even on modest hardware.",
    "This is why they're considered one of the best in the business. Quality speaks for itself.",
    "The world design is absolutely stunning. Every screenshot is a work of art honestly.",
    "I appreciate how transparent they've been about development. Refreshing to see in this industry.",
    "My wallet is already crying but my inner child is doing backflips right now.",
    "Me trying to explain to my family why this is a big deal: they still don't get it.",
    "Plot twist: the real announcement was the friends we made along the way.",
    "My bank account is saying no but my heart is saying absolutely yes.",
    "I was going to save money this month but I guess that's not happening anymore.",
    "RIP my free time. Not that I was using it productively anyway to be honest.",
    "The wife is going to kill me but it'll be worth it. Some things are worth the risk.",
    "I took a day off work for this announcement. No regrets whatsoever.",
    "My productivity this week is zero. My excitement levels are maximum. Worth it.",
    "I told myself I wouldn't get hyped. I failed. I am maximum hyped and proud of it.",
    "The way my heart rate spiked when I saw this is concerning but completely acceptable.",
    "I'm supposed to be working but here I am watching this announcement on repeat.",
    "This is going to ruin my sleep schedule and I'm completely okay with that decision.",
    "I've watched the trailer 15 times already. Send help. Actually don't, I'm fine.",
    "My backlog is crying but this is going straight to the top of the list immediately.",
    "Famous last words: I'll just take a quick look. Two hours later here we are.",
  ]

  const COMMENT_TOTAL = 20000
  const allUserIds = allUsers.map(u => u.id)
  const allComments = []
  let parentPool = []

  for (let i = 0; i < COMMENT_TOTAL; i++) {
    const article = allArticleIds[randomInt(0, allArticleIds.length - 1)]
    const user = allUserIds[randomInt(0, allUserIds.length - 1)]
    const userName = allUsers.find(u => u.id === user)?.name || "Player"
    const isReply = Math.random() < 0.22 && parentPool.length > 0
    const parentId = isReply ? pick(parentPool) : null
    const cid = uuid()
    const createdAt = randomDate(new Date("2025-01-01"), new Date("2026-06-24"))
    const timeDecay = Math.max(0.3, 1 - (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30) / 18)
    const likes = Math.floor(randomInt(5, 500) * timeDecay)

    let text
    if (isReply && parentPool.length > 0) {
      const parentText = pick(COMMENT_TEXTS)
      const excerpt = parentText.split(" ").slice(0, 3).join(" ")
      const replyTemplates = [
        `Exactly this! "${excerpt}..." really nailed it with that point.`,
        `I disagree with "${excerpt}..." but I can see where you're coming from.`,
        `To add to what "${excerpt}..." said, the implications go even further.`,
        `This is what "${excerpt}..." was talking about. Perfect example.`,
        `Building on "${excerpt}..." comment, there's another angle worth considering.`,
        `Couldn't agree more with "${excerpt}..." This is exactly the right take.`,
        `Thanks for bringing up "${excerpt}..." I had the same thought.`,
        `"${excerpt}..." makes a great point but context matters here too.`,
      ]
      text = pick(replyTemplates)
    } else {
      text = pick(COMMENT_TEXTS)
    }

    allComments.push({
      id: cid,
      content: text,
      articleId: article,
      userId: user,
      userName,
      likes,
      parentId,
      createdAt: createdAt.toISOString(),
    })

    if (isReply) {
      parentPool.push(cid)
      if (parentPool.length > 2000) parentPool = parentPool.slice(-1000)
    } else if (Math.random() < 0.08) {
      parentPool.push(cid)
      if (parentPool.length > 2000) parentPool = parentPool.slice(-1000)
    }

    if (i % 5000 === 0 && i > 0) console.log(`    ${i}/${COMMENT_TOTAL} comments...`)
  }

  // Write 4 comment chunks
  const COMMENTS_PER_CHUNK = 5000
  for (let chunk = 0; chunk < 4; chunk++) {
    const start = chunk * COMMENTS_PER_CHUNK
    const end = start + COMMENTS_PER_CHUNK
    const chunkData = allComments.slice(start, end)
    const path = `${dataDir}/comments-${chunk + 1}.json`
    writeFileSync(path, JSON.stringify(chunkData))
    const size = (Buffer.byteLength(JSON.stringify(chunkData)) / 1024).toFixed(0)
    console.log(`  ${path}: ${chunkData.length} comments, ${size} KB`)
  }

  // === SUMMARY ===
  console.log("\n✅ Generation complete!")
  console.log(`  Articles: ${totalArticles} (across ${Object.keys(articlesByCategory).length} category files)`)
  console.log(`  Users: ${TOTAL_USERS} (4 chunks)`)
  console.log(`  Comments: ${COMMENT_TOTAL} (4 chunks)`)
  console.log(`  Paragraph templates: ${Object.values(CAT_BODIES).reduce((s, a) => s + a.length, 0) + GENERIC_BODIES.length}`)
  console.log(`  Duplicates removed: ${dupesRemoved}`)
  console.log("\n  JSON files ready in public/data/")
}

main().catch(console.error)
