import { Project, Story, StoryBible, Character, Location, Episode } from '../types';

export const DEMO_PROJECT_ID = 'demo-mystery-door';

export const DEMO_PROJECT: Project = {
  id: DEMO_PROJECT_ID,
  name: 'The Mystery Door',
  description: 'An antiquarian scholar discovers a mechanical celestial key hidden inside a 400-year-old maritime atlas, unlocking a hidden doorway beneath the ancient coastal city archive.',
  genre: 'Mystery & Supernatural Thriller',
  aspectRatio: '9:16',
  language: 'en',
  targetDuration: 60,
  status: 'Ready',
  workspacePath: 'StoryForgeProjects/TheMysteryDoor',
  createdAt: Date.now() - 86400000 * 2,
  updatedAt: Date.now(),
};

export const DEMO_STORY: Story = {
  id: 'story-demo-01',
  projectId: DEMO_PROJECT_ID,
  title: 'The Mystery Door',
  genre: 'Mystery',
  wordCount: 1420,
  analyzedAt: Date.now() - 3600000 * 5,
  rawText: `PROLOGUE: THE OBSIDIAN KEY

Ahmed had spent six months examining the maritime codices of the Royal Archivist in the harbor quarter. The air in the vaults smelled of aged vellum, dried clove, and sea salt. It was late afternoon when the spine of an unmarked 16th-century celestial atlas cracked beneath his fingertips, revealing a hollow recess lined with velvet.

Inside lay a heavy mechanical key forged of cold black brass, its head inscribed with interlocking astrological gears and a three-tiered crescent moon.

"Layla, look at the precision on these teeth," Ahmed whispered, his pulse quickening. "This wasn't forged by a blacksmith. It belongs to a clockwork lock."

Layla adjusted her spectacles, her sharp hazel eyes scanning the Latin margins. "The margin notes say: 'The fourth archway counts the hours backward.' Ahmed, that archway isn't on any modern blueprint of this library."

CHAPTER 1: THE FOURTH ARCH

Beneath the east rotunda, behind seven rows of forgotten genealogies, stood a sealed limestone archway covered in centuries of plaster and ivy. As Ahmed inserted the brass key into a barely visible fissure between two foundation stones, the entire room seemed to hold its breath.

A deep mechanical thrum echoed beneath the floorboards. The wall shivered, and with a hiss of releasing air, the stones pivoted inward, revealing a descending stairwell illuminated by faint cerulean phosphor.

"Whatever was sealed down here," Layla said softly, checking her flashlight, "was deliberately hidden from the light of day."

CHAPTER 2: THE CHRONOS VAULT

They stepped into the darkness. Every ten paces, copper lanterns on the stone walls flared with cold blue flame. At the bottom of sixty steps lay a vast circular chamber. Suspended from the vaulted ceiling was a mammoth pendulum of black basalt, sweeping in silence across a floor of mirror-smooth black water.

Around the water's edge stood twelve statues with masked faces, each holding an hourglass where glowing sand fell upward into the top chamber.

"Ahmed," Layla breathed, pointing upward. "Look at the dust motes."

Ahmed raised his hand. The floating flecks of dust were frozen stationary in the air. Time inside the chamber had ceased to march forward. And in the center of the pool, an ancient iron pedestal held a sealed cylindrical canister marked with his grandfather's crest.`,
};

export const DEMO_CHARACTERS: Character[] = [
  {
    id: 'char-ahmed',
    projectId: DEMO_PROJECT_ID,
    name: 'Ahmed Al-Mansoor',
    age: '28',
    gender: 'Male',
    personality: 'Curious, determined, observant, cautious yet driven by historical mysteries.',
    appearance: 'Young Middle Eastern man, 28 years old, short black wavy hair, warm dark brown eyes, slight stubble, athletic build.',
    hair: 'Short wavy black hair',
    eyes: 'Dark brown, observant',
    clothing: 'Dark charcoal travel coat over a cream linen shirt, brass wrist watch, leather messenger bag.',
    importantTraits: 'Expert in medieval clockwork mechanisms and cartography.',
    characterPrompt: 'A 28-year-old Middle Eastern man named Ahmed, short neat wavy black hair, expressive dark brown eyes, light beard stubble, wearing a dark charcoal travel coat and linen shirt, sharp intellectual expression, cinematic studio lighting.',
    referenceImages: [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="100%" height="100%" fill="%231e1b4b"/><circle cx="200" cy="180" r="80" fill="%23c28e67"/><circle cx="175" cy="170" r="8" fill="%23111"/><circle cx="225" cy="170" r="8" fill="%23111"/><path d="M185 210 Q200 220 215 210" stroke="%23333" stroke-width="3" fill="none"/><path d="M120 160 Q200 80 280 160 Q200 120 120 160" fill="%23111827"/><rect x="130" y="270" width="140" height="240" rx="20" fill="%23374151"/><rect x="155" y="275" width="90" height="60" fill="%23f3f4f6"/><text x="200" y="560" font-family="sans-serif" font-size="20" fill="%23cbd5e1" text-anchor="middle">Ahmed Al-Mansoor</text></svg>'
    ],
    voiceId: 'en-male-narrator',
    notes: 'Primary protagonist. Possesses sharp deduction skills.',
  },
  {
    id: 'char-layla',
    projectId: DEMO_PROJECT_ID,
    name: 'Dr. Layla Haddad',
    age: '34',
    gender: 'Female',
    personality: 'Pragmatic, meticulous, protective mentor, fluent in dead languages.',
    appearance: 'Olive complexion, sharp hazel eyes, long dark hair braided over one shoulder, slender wire-rim spectacles.',
    hair: 'Long dark chestnut hair in a single neat braid',
    eyes: 'Hazel green, focused',
    clothing: 'Tailored olive utility vest over an ecru sweater, brass notebook clip, leather boots.',
    importantTraits: 'Chief archivist and cryptographer.',
    characterPrompt: 'A 34-year-old woman named Layla, hazel eyes, slender wire-rim glasses, long dark chestnut braid over one shoulder, olive field vest, poised and scholarly look, soft rim lighting.',
    referenceImages: [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="100%" height="100%" fill="%2314532d"/><circle cx="200" cy="180" r="75" fill="%23d6a47a"/><circle cx="175" cy="175" r="7" fill="%2322543d"/><circle cx="225" cy="175" r="7" fill="%2322543d"/><path d="M160 165 h30 M210 165 h30" stroke="%23d97706" stroke-width="2"/><path d="M190 165 h20" stroke="%23d97706" stroke-width="2"/><path d="M130 180 Q200 90 270 180 Q200 130 130 180" fill="%233b2f2f"/><rect x="140" y="270" width="120" height="240" rx="15" fill="%23365314"/><text x="200" y="560" font-family="sans-serif" font-size="20" fill="%23dcfce7" text-anchor="middle">Dr. Layla Haddad</text></svg>'
    ],
    voiceId: 'en-female-scholar',
    notes: 'Brings historical grounding and cautions Ahmed against reckless moves.',
  },
];

export const DEMO_LOCATIONS: Location[] = [
  {
    id: 'loc-archive',
    projectId: DEMO_PROJECT_ID,
    name: 'The Grand Royal Archive',
    description: 'A 400-year-old coastal library filled with towering mahogany bookstacks, stained glass rose windows, and dust floating in amber beams of sunlight.',
    architecture: 'High Gothic Renaissance stone arches, ornate dark walnut spiral staircases.',
    lighting: 'Golden afternoon sunlight piercing dust motes through stained glass.',
    timeOfDay: 'Late afternoon / Golden Hour',
    atmosphere: 'Solemn, historic, silent except for the fluttering of parchment.',
    referenceImages: [],
    canonicalPrompt: 'Interior of a grand 16th century royal archive library, towering dark mahogany bookcases reaching high vaulted ceilings, shafts of warm golden sun rays shining down on vellum manuscripts and brass astrolabes, highly detailed cinematic rendering.',
  },
  {
    id: 'loc-archway',
    projectId: DEMO_PROJECT_ID,
    name: 'The Whispering Arch',
    description: 'A concealed subterranean passage hidden behind false masonry, lit by eerie bioluminescent blue moss and copper torches.',
    architecture: 'Cyclopean carved limestone with astronomical constellations etched along the rim.',
    lighting: 'Deep electric cyan luminescence with flickering warm flame rim.',
    timeOfDay: 'Underground perpetual night',
    atmosphere: 'Mysterious, quiet, damp, charged with static electricity.',
    referenceImages: [],
    canonicalPrompt: 'A secret subterranean stone archway in an ancient vault, glowing cyan bioluminescence, intricate astrological glyphs carved into mossy limestone, cinematic mystery aesthetic.',
  },
  {
    id: 'loc-vault',
    projectId: DEMO_PROJECT_ID,
    name: 'The Chronos Vault',
    description: 'A colossal circular chamber with a floor of still black water and a giant suspended pendulum.',
    architecture: 'Monolithic obsidian pillars surrounding a still subterranean lake beneath a domed rotunda.',
    lighting: 'Starry pinpoints of light reflected on dark mirror water.',
    timeOfDay: 'Timeless',
    atmosphere: 'Otherworldly, suspended in time, majestic and silent.',
    referenceImages: [],
    canonicalPrompt: 'Massive subterranean dome with a mirror-smooth lake of black water, towering obsidian pillars, glowing hourglass statues where sand flows upward, cinematic 8k fantasy mystery.',
  },
];

export const DEMO_STORY_BIBLE: StoryBible = {
  projectId: DEMO_PROJECT_ID,
  title: 'The Mystery Door',
  genre: 'Mystery / Supernatural Thriller',
  summary: 'In an ancient coastal library, scholar Ahmed discovers a mechanical clockwork key concealed in a 16th-century atlas. Together with Dr. Layla, he unlocks a forgotten chamber where time itself flows in reverse, leading to secrets left behind by his ancestors.',
  chapters: [
    { id: 'ch-1', title: 'The Obsidian Key', summary: 'Ahmed uncovers the concealed key inside the spine of an antique maritime atlas.' },
    { id: 'ch-2', title: 'The Fourth Arch', summary: 'Ahmed and Layla locate the hidden limestone archway and unlock the subterranean stairs.' },
    { id: 'ch-3', title: 'The Chronos Vault', summary: 'Inside the submerged chamber, they witness time defying gravity as sand flows upward.' },
  ],
  relationships: [
    { character1: 'Ahmed Al-Mansoor', character2: 'Dr. Layla Haddad', relationship: 'Senior mentor and trusted research partner' },
  ],
  objects: [
    { name: 'The Obsidian Key', description: 'Heavy mechanical black brass key with three interlocking astronomical gears.', significance: 'Only mechanism capable of disengaging the vault pins.' },
    { name: 'The Reversed Hourglass', description: 'Glass vessel containing glowing sand that flows upward against gravity.', significance: 'Indicates the local temporal inversion field.' },
  ],
  majorEvents: [
    { id: 'ev-1', description: 'Cracking open the atlas spine reveals the concealed mechanical key.' },
    { id: 'ev-2', description: 'Turning the key triggers the hydraulic pivot of the ancient library wall.' },
    { id: 'ev-3', description: 'Descending into the vault where dust motes and time freeze in place.' },
  ],
  timeline: [
    { time: '1642 AD', event: 'The Chronos Vault is sealed by the Guild of Astrologers.' },
    { time: 'Present Day, 16:30', event: 'Ahmed finds the key inside the atlas.' },
    { time: 'Present Day, 17:15', event: 'The Whispering Arch opens beneath the rotunda.' },
    { time: 'Present Day, 17:40', event: 'Ahmed and Layla reach the water mirror pedestal.' },
  ],
  emotionalTone: 'Tense intrigue, intellectual wonder, awe-inspiring revelation.',
  storyArcs: ['Unveiling the forbidden vault', 'Discovering family heritage in the archives'],
  styleRules: [
    'Maintain warm amber library tones contrasting with electric cyan subterranean lighting.',
    'Every scene involving Ahmed must keep his dark travel jacket and inquisitive expression.',
    'Pacing must build with a tight hook in the first 3 seconds of each episode.',
  ],
};

// Generates high quality stylized SVG procedural backgrounds for offline demo rendering
function createDemoSvgImage(title: string, subtitle: string, bgGradient: string, accentColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        ${bgGradient}
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect width="100%" height="100%" fill="url(#glow)"/>
    <rect width="100%" height="100%" fill="url(#grid)"/>

    <!-- Decorative Arch and Runes -->
    <circle cx="540" cy="800" r="320" fill="none" stroke="${accentColor}" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="8 6"/>
    <circle cx="540" cy="800" r="260" fill="none" stroke="${accentColor}" stroke-opacity="0.5" stroke-width="3"/>
    <circle cx="540" cy="800" r="200" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    
    <!-- Central Icon / Focal Silhouette -->
    <polygon points="540,650 630,820 450,820" fill="none" stroke="${accentColor}" stroke-width="4"/>
    <circle cx="540" cy="760" r="30" fill="${accentColor}" fill-opacity="0.8"/>
    <path d="M 540 860 L 540 1000" stroke="${accentColor}" stroke-width="6"/>
    <circle cx="540" cy="1020" r="16" fill="${accentColor}"/>

    <!-- Top Badge -->
    <rect x="340" y="240" width="400" height="56" rx="28" fill="rgba(0,0,0,0.6)" stroke="${accentColor}" stroke-width="1.5"/>
    <text x="540" y="276" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="22" fill="#f8fafc" text-anchor="middle" letter-spacing="4">STORYFORGE AI STUDIO</text>

    <!-- Lower Title Card -->
    <rect x="100" y="1320" width="880" height="340" rx="24" fill="rgba(10,15,30,0.85)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
    <text x="540" y="1420" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="52" fill="#ffffff" text-anchor="middle">${title}</text>
    <text x="540" y="1490" font-family="'Plus Jakarta Sans', sans-serif" font-weight="500" font-size="28" fill="#94a3b8" text-anchor="middle">${subtitle}</text>

    <!-- Watermark / Footer -->
    <text x="540" y="1590" font-family="'JetBrains Mono', monospace" font-size="20" fill="${accentColor}" text-anchor="middle">SCENE RENDER // 1080x1920 (9:16 VERTICAL)</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEMO_EPISODES: Episode[] = [
  {
    id: 'ep-01',
    projectId: DEMO_PROJECT_ID,
    episodeNumber: 1,
    title: 'The Key in the Spine',
    summary: 'Ahmed examines an unmarked 16th-century atlas in the library vaults and finds a mechanical brass key with interlocking gears.',
    hook: 'What would you do if a 400-year-old book held the key to a door that doesn\'t exist?',
    endingCta: 'Follow for Episode 2 to see what hides behind the arch!',
    nextEpisodeHook: 'Next episode: Ahmed turns the key, and the wall begins to move...',
    targetDuration: 45,
    estimatedDuration: 42,
    musicSuggestion: 'Subtle tension ambient drone with clockwork ticking',
    scenes: [
      {
        id: 'sc-1-1',
        episodeId: 'ep-01',
        sceneNumber: 1,
        duration: 8,
        narration: 'Deep inside the royal archives, Ahmed pulled a decaying leather atlas from the highest shelf.',
        dialogue: '"This volume hasn\'t been cataloged in three centuries."',
        characterIds: ['char-ahmed'],
        locationId: 'loc-archive',
        visualPrompt: 'Young scholar Ahmed standing beside towering mahogany bookshelves in a dusty gothic library, reaching for an antique leather atlas, shafts of golden sun rays.',
        cameraMotion: 'zoom_in',
        cameraAngle: 'medium',
        lighting: 'Amber dust beams from stained glass',
        mood: 'Suspenseful curiosity',
        transition: 'cut',
        imageUrl: createDemoSvgImage('THE ARCHIVE VAULT', 'Ahmed reaches for the forgotten atlas', '<stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#0f172a"/>', '#f59e0b'),
        subtitleText: 'Deep inside the royal archives, Ahmed pulled a decaying atlas.',
      },
      {
        id: 'sc-1-2',
        episodeId: 'ep-01',
        sceneNumber: 2,
        duration: 10,
        narration: 'As his fingers traced the binding, the leather spine cracked open, exposing a velvet-lined secret chamber.',
        dialogue: '',
        characterIds: ['char-ahmed'],
        locationId: 'loc-archive',
        visualPrompt: 'Close up of hands opening the hollowed leather spine of an antique book, revealing a glowing black brass mechanical key with three tiny cogs.',
        cameraMotion: 'pan_down',
        cameraAngle: 'close_up',
        lighting: 'Soft rim light highlighting brass reflection',
        mood: 'Shock and awe',
        transition: 'crossfade',
        imageUrl: createDemoSvgImage('THE OBSIDIAN KEY', 'Mechanical brass key discovered in book spine', '<stop offset="0%" stop-color="#2d1537"/><stop offset="100%" stop-color="#090514"/>', '#a855f7'),
        subtitleText: 'The leather spine cracked open, exposing a velvet chamber.',
      },
      {
        id: 'sc-1-3',
        episodeId: 'ep-01',
        sceneNumber: 3,
        duration: 12,
        narration: 'Dr. Layla inspected the Latin inscription engraved across the teeth. It spoke of a fourth arch that counts hours backward.',
        dialogue: '"Ahmed, there are only three arches in this entire building."',
        characterIds: ['char-ahmed', 'char-layla'],
        locationId: 'loc-archive',
        visualPrompt: 'Dr. Layla inspecting a brass key through a jeweler loupe alongside Ahmed in a shadowy study surrounded by celestial globes.',
        cameraMotion: 'zoom_out',
        cameraAngle: 'medium',
        lighting: 'Dramatic overhead lamp light',
        mood: 'Intellectual breakthrough',
        transition: 'fade',
        imageUrl: createDemoSvgImage('ANCIENT CIPHER', 'Dr. Layla deciphers the Latin engraving', '<stop offset="0%" stop-color="#064e3b"/><stop offset="100%" stop-color="#022c22"/>', '#10b981'),
        subtitleText: 'It spoke of a fourth arch that counts hours backward.',
      },
      {
        id: 'sc-1-4',
        episodeId: 'ep-01',
        sceneNumber: 4,
        duration: 12,
        narration: 'Behind seven rows of genealogies in the sub-basement, their flashlight beams caught a hairline crack in the limestone.',
        dialogue: '"The key fits. Exactly."',
        characterIds: ['char-ahmed', 'char-layla'],
        locationId: 'loc-archway',
        visualPrompt: 'Ahmed inserting the black brass key into a crack between ancient stone blocks in a dark basement as dust shakes free.',
        cameraMotion: 'zoom_in',
        cameraAngle: 'close_up',
        lighting: 'Single harsh flashlight cone',
        mood: 'Cliffhanger tension',
        transition: 'dip_to_black',
        imageUrl: createDemoSvgImage('THE HIDDEN SEAM', 'The key slides into the foundation stone', '<stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#020617"/>', '#38bdf8'),
        subtitleText: 'Behind seven rows of books, their flashlights caught a crack.',
      },
    ],
    subtitles: [
      { id: 'sub-1', startTime: 0, endTime: 8, text: 'Deep inside the royal archives, Ahmed pulled a decaying leather atlas.' },
      { id: 'sub-2', startTime: 8, endTime: 18, text: 'The spine cracked open, exposing a velvet-lined secret chamber with a clockwork key.' },
      { id: 'sub-3', startTime: 18, endTime: 30, text: 'Dr. Layla deciphered the Latin: The fourth arch counts hours backward.' },
      { id: 'sub-4', startTime: 30, endTime: 42, text: 'In the lowest basement, the key slid into the stone. The wall shivered.' },
    ],
    socialMetadata: {
      episodeId: 'ep-01',
      tiktokCaption: 'They told him the library only had three arches... until he cracked open this 400-year-old atlas! 🗝️⏳ #Mystery #ShortStory #StoryForgeAI #BookTok #UrbanLegend',
      instagramCaption: 'What would you do if an antique book held the key to a door that doesn\'t exist? Episode 1 of The Mystery Door. Turn sound on! 🔊 #MysteryNovel #AIStoryteller #HistoricalMystery',
      facebookCaption: 'An antiquarian scholar uncovers an impossible secret sealed in the foundation stones. Episode 1 of The Mystery Door.',
      youtubeTitle: 'The Key Hidden in a 400-Year-Old Atlas | The Mystery Door Ep. 1 #Shorts',
      youtubeDescription: 'Ahmed discovers a clockwork brass key inside the spine of an antique maritime atlas, revealing a hidden subterranean passage.\n\nSubscribe for Episode 2!\nCreated with StoryForge AI.',
      hashtags: ['#Mystery', '#ShortStory', '#StoryForgeAI', '#Fiction', '#BookTok'],
      keywords: ['ancient mystery', 'clockwork key', 'library secret', 'audiobook short'],
      cta: 'Follow for Episode 2!',
    },
  },
  {
    id: 'ep-02',
    projectId: DEMO_PROJECT_ID,
    episodeNumber: 2,
    title: 'The Whispering Arch',
    summary: 'The secret wall pivots open, leading down a spiral staircase where lanterns ignite with electric blue fire.',
    hook: 'The wall didn\'t break—it unlocked. And whatever was down there was still breathing.',
    endingCta: 'Double tap if you would walk down those stairs!',
    nextEpisodeHook: 'Next: The bottom of the stairs reveals something that violates physics.',
    targetDuration: 45,
    estimatedDuration: 40,
    musicSuggestion: 'Low subterranean resonant bass with ethereal choir',
    scenes: [
      {
        id: 'sc-2-1',
        episodeId: 'ep-02',
        sceneNumber: 1,
        duration: 9,
        narration: 'With a heavy mechanical rumble, the limestone foundation shifted back, unlocking a stairwell lost to history.',
        characterIds: ['char-ahmed'],
        locationId: 'loc-archway',
        visualPrompt: 'Ancient stone archway grinding open into a dark subterranean spiral staircase, blue phosphor glowing on walls.',
        cameraMotion: 'pan_down',
        cameraAngle: 'wide',
        lighting: 'Deep cyan glow contrast with torch orange',
        mood: 'Awe and trepidation',
        transition: 'cut',
        imageUrl: createDemoSvgImage('THE OPENING', 'Limestone pivots into forgotten stairs', '<stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#020617"/>', '#06b6d4'),
        subtitleText: 'With a heavy rumble, the limestone shifted back into the dark.',
      },
      {
        id: 'sc-2-2',
        episodeId: 'ep-02',
        sceneNumber: 2,
        duration: 11,
        narration: 'As Ahmed took the first step, cold copper lanterns mounted along the damp walls flared into blue life.',
        characterIds: ['char-ahmed', 'char-layla'],
        locationId: 'loc-archway',
        visualPrompt: 'Row of ancient copper lanterns igniting with blue fire along a mossy stone corridor as two silhouettes descend.',
        cameraMotion: 'zoom_in',
        cameraAngle: 'medium',
        lighting: 'Bioluminescent blue lanterns lighting dust',
        mood: 'Mystical wonder',
        transition: 'crossfade',
        imageUrl: createDemoSvgImage('COLD FIRE', 'Copper lanterns flare with cyan flames', '<stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#090514"/>', '#3b82f6'),
        subtitleText: 'Cold copper lanterns along the damp walls flared into blue life.',
      },
      {
        id: 'sc-2-3',
        episodeId: 'ep-02',
        sceneNumber: 3,
        duration: 10,
        narration: 'Layla touched the carvings. "These aren\'t religious texts, Ahmed. These are orbital equations for planets that haven\'t aligned in centuries."',
        characterIds: ['char-layla'],
        locationId: 'loc-archway',
        visualPrompt: 'Close up of fingers tracing glowing celestial equations carved into subterranean bedrock.',
        cameraMotion: 'pan_right',
        cameraAngle: 'close_up',
        lighting: 'Soft cyan rim illumination on carved stone',
        mood: 'Intellectual revelation',
        transition: 'slide',
        imageUrl: createDemoSvgImage('CELESTIAL EQUATIONS', 'Carvings depicting rare planetary conjunctions', '<stop offset="0%" stop-color="#14532d"/><stop offset="100%" stop-color="#052e16"/>', '#22c55e'),
        subtitleText: 'These are orbital equations for planets that haven\'t aligned.',
      },
      {
        id: 'sc-2-4',
        episodeId: 'ep-02',
        sceneNumber: 4,
        duration: 10,
        narration: 'At the sixty-second step, the corridor opened into an abyss of black water reflecting a sky of mechanical stars.',
        characterIds: ['char-ahmed', 'char-layla'],
        locationId: 'loc-vault',
        visualPrompt: 'Wide shot of two explorers standing at the threshold of a mammoth domed vault with a mirror-black lake.',
        cameraMotion: 'zoom_out',
        cameraAngle: 'wide',
        lighting: 'Atmospheric volumetric starlight reflection',
        mood: 'Grand climactic scale',
        transition: 'dip_to_black',
        imageUrl: createDemoSvgImage('THE THRESHOLD', 'Reaching the subterranean water vault', '<stop offset="0%" stop-color="#2e1065"/><stop offset="100%" stop-color="#0f051d"/>', '#c084fc'),
        subtitleText: 'The corridor opened into an abyss of black water.',
      },
    ],
    subtitles: [
      { id: 'sub-2-1', startTime: 0, endTime: 9, text: 'With a heavy mechanical rumble, the limestone foundation shifted back.' },
      { id: 'sub-2-2', startTime: 9, endTime: 20, text: 'As Ahmed took the first step, copper lanterns flared into blue life.' },
      { id: 'sub-2-3', startTime: 20, endTime: 30, text: 'These aren\'t religious texts—they are planetary orbital equations.' },
      { id: 'sub-2-4', startTime: 30, endTime: 40, text: 'At the bottom, an abyss of black water reflected impossible stars.' },
    ],
    socialMetadata: {
      episodeId: 'ep-02',
      tiktokCaption: 'Lanterns igniting by themselves after 400 years?! What is down here?! 😱🕯️ #StoryTime #MysteryTikTok #SciFiThriller #Shorts',
      instagramCaption: 'The door opened. But what they found underneath the library shouldn\'t exist on Earth. Episode 2 of The Mystery Door.',
      facebookCaption: 'They went beneath the city foundation and found lanterns still burning with blue flame. Episode 2 of The Mystery Door.',
      youtubeTitle: 'The Subterranean Vault Under The Library | The Mystery Door Ep. 2 #Shorts',
      youtubeDescription: 'Ahmed and Layla descend into the secret passage beneath the archive and find celestial mechanisms preserved for centuries.',
      hashtags: ['#Mystery', '#Underground', '#AIStory', '#Thriller', '#Shorts'],
      keywords: ['secret passage', 'blue lanterns', 'hidden ruins', 'cliffhanger'],
      cta: 'Subscribe for the finale!',
    },
  },
  {
    id: 'ep-03',
    projectId: DEMO_PROJECT_ID,
    episodeNumber: 3,
    title: 'The Reversed Hourglass',
    summary: 'Inside the Chronos Vault, Ahmed discovers that time is suspended—and a sealed letter bears his grandfather\'s signature seal.',
    hook: 'Have you ever seen sand fall UP? In this room, time is flowing backward.',
    endingCta: 'Comment what you would ask your past self! Series 2 coming soon.',
    nextEpisodeHook: 'Season Finale: The message inside the cylinder changes everything.',
    targetDuration: 45,
    estimatedDuration: 42,
    musicSuggestion: 'Epic cinematic orchestral crescendo with ticking pulse',
    scenes: [
      {
        id: 'sc-3-1',
        episodeId: 'ep-03',
        sceneNumber: 1,
        duration: 10,
        narration: 'In the center of the lake stood twelve hooded statues, each clasping a crystalline hourglass.',
        characterIds: ['char-ahmed'],
        locationId: 'loc-vault',
        visualPrompt: 'Twelve obsidian statues standing in a circle around an underground lake, holding crystalline hourglasses glowing with golden luminescence.',
        cameraMotion: 'pan_left',
        cameraAngle: 'wide',
        lighting: 'Ethereal golden luminescence from crystal hourglasses',
        mood: 'Awe inspiring and eerie',
        transition: 'cut',
        imageUrl: createDemoSvgImage('THE TWELVE GUARDIANS', 'Statues holding illuminated hourglasses', '<stop offset="0%" stop-color="#022c22"/><stop offset="100%" stop-color="#020617"/>', '#34d399'),
        subtitleText: 'In the center of the lake stood twelve hooded statues with hourglasses.',
      },
      {
        id: 'sc-3-2',
        episodeId: 'ep-03',
        sceneNumber: 2,
        duration: 11,
        narration: 'Ahmed leaned closer. Inside the glass, glowing golden grains of sand were defying gravity, drifting upward into the top sphere.',
        characterIds: ['char-ahmed'],
        locationId: 'loc-vault',
        visualPrompt: 'Extreme close up of an ornate hourglass where glowing amber sand granules float upward in slow motion defying gravity.',
        cameraMotion: 'zoom_in',
        cameraAngle: 'extreme_close_up',
        lighting: 'Sparkling amber particle glow',
        mood: 'Reality defying',
        transition: 'crossfade',
        imageUrl: createDemoSvgImage('REVERSED GRAVITY', 'Sand particles drifting upward against time', '<stop offset="0%" stop-color="#451a03"/><stop offset="100%" stop-color="#0c0a09"/>', '#fbbf24'),
        subtitleText: 'Inside the glass, golden grains drifted upward against gravity.',
      },
      {
        id: 'sc-3-3',
        episodeId: 'ep-03',
        sceneNumber: 3,
        duration: 11,
        narration: 'On the center stone altar rested an iron cylinder. Stamped into the wax seal was the crest of Ahmed\'s grandfather.',
        dialogue: '"He didn\'t disappear in 1968... he came here."',
        characterIds: ['char-ahmed', 'char-layla'],
        locationId: 'loc-vault',
        visualPrompt: 'Ahmed picking up an antique iron scroll canister from an altar, recognizing an engraved family signet crest.',
        cameraMotion: 'zoom_in',
        cameraAngle: 'close_up',
        lighting: 'Warm key light on iron canister',
        mood: 'Personal shock and emotional reveal',
        transition: 'fade',
        imageUrl: createDemoSvgImage('THE FAMILY SEAL', 'Grandfather signet crest on the iron canister', '<stop offset="0%" stop-color="#3b0764"/><stop offset="100%" stop-color="#0f051d"/>', '#e879f9'),
        subtitleText: 'Stamped into the wax was the crest of Ahmed\'s grandfather.',
      },
      {
        id: 'sc-3-4',
        episodeId: 'ep-03',
        sceneNumber: 4,
        duration: 10,
        narration: 'The scroll began: "If you are reading this, Ahmed, the clock is already ticking backward. You must finish what I started."',
        dialogue: '',
        characterIds: ['char-ahmed'],
        locationId: 'loc-vault',
        visualPrompt: 'Ahmed holding the unfurled vellum scroll as the pendulum begins to swing faster above the black water.',
        cameraMotion: 'zoom_out',
        cameraAngle: 'medium',
        lighting: 'Dramatic high contrast shadows and light',
        mood: 'Epic cliffhanger',
        transition: 'dip_to_black',
        imageUrl: createDemoSvgImage('THE MESSAGE', 'You must finish what I started...', '<stop offset="0%" stop-color="#18181b"/><stop offset="100%" stop-color="#09090b"/>', '#f43f5e'),
        subtitleText: 'The clock is already ticking backward. You must finish what I started.',
      },
    ],
    subtitles: [
      { id: 'sub-3-1', startTime: 0, endTime: 10, text: 'In the center of the lake stood twelve hooded statues with crystal hourglasses.' },
      { id: 'sub-3-2', startTime: 10, endTime: 21, text: 'Golden grains of sand drifted upward into the top sphere against gravity.' },
      { id: 'sub-3-3', startTime: 21, endTime: 32, text: 'On the center stone altar was a canister with his grandfather\'s crest.' },
      { id: 'sub-3-4', startTime: 32, endTime: 42, text: 'The clock is already ticking backward. You must finish what I started.' },
    ],
    socialMetadata: {
      episodeId: 'ep-03',
      tiktokCaption: 'HIS GRANDFATHER WAS HERE ALL ALONG?! 🤯⏳ Part 3 of The Mystery Door. Did you guess this plot twist?! #ShortStoryFinale #PlotTwist #SciFiStory #BookTokViral',
      instagramCaption: 'The sand was falling UP. And the seal on the cylinder belonged to his grandfather. The finale of The Mystery Door Season 1. #StoryForge #ShortFilm #FictionShorts',
      facebookCaption: 'The season finale of The Mystery Door. What was hidden in the Chronos Vault?',
      youtubeTitle: 'The Sand Falls UP! Incredible Plot Twist | The Mystery Door Ep. 3 #Shorts',
      youtubeDescription: 'The season finale of The Mystery Door. Ahmed finds an impossible vault and a message written to him decades ago.',
      hashtags: ['#PlotTwist', '#MysteryShorts', '#StoryForgeAI', '#Fiction', '#SeriesFinale'],
      keywords: ['time travel', 'grandfather paradox', 'hourglass', 'mystery finale'],
      cta: 'Comment for Season 2!',
    },
  },
];
