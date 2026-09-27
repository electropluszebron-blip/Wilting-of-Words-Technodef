import { Chapter, Quote } from '../types';

export const NOVEL_META = {
  title: "WILTING OF WORDS",
  tagline: "Some voices are silenced in life, but their words live louder than ever.",
  subtitle: "A poignantly crafted page-by-page digital reading experience exploring voice, survival, and identity of Aratrika.",
  authorName: "Pratyay Saha",
  publisher: "Technodef",
  googleDrivePdfUrl: "https://drive.google.com/file/d/1avq1PulH3i3avuRI8qrDtSBCF1GQeJUR/preview",
  googleDocsViewerUrl: "https://docs.google.com/viewer?srcid=1avq1PulH3i3avuRI8qrDtSBCF1GQeJUR&pid=explorer&efh=false&a=v&chrome=false&embedded=true",
  googleDriveDirectLink: "https://drive.google.com/file/d/1avq1PulH3i3avuRI8qrDtSBCF1GQeJUR/view?usp=drivesdk"
};

export const AUTHOR_BIO = {
  name: "Pratyay Saha",
  role: "Author & Literary Scholar",
  dob: "29 November 2008",
  birthplace: "Chakdaha, Nadia",
  school: "St. Mary’s Arcadian School",
  grade: "Class XI Science",
  academicAchievement: "99.4% achiever in CBSE Class 10",
  bio: "Born on 29 November 2008 in Chakdaha, Pratyay Saha is a Class XI Science student at St. Mary’s Arcadian School. A 99.4% achiever in CBSE Class 10, he is passionate about classical literature, recitation, debating and academics. His dream is to become a doctor and contribute to society through knowledge, compassion and words.",
  achievements: [
    { label: "99.4% CBSE Class 10", icon: "GraduationCap" },
    { label: "Recitation | Debate | Literature", icon: "BookOpen" },
    { label: "St. Mary’s Arcadian School", icon: "Building" },
    { label: "Published by Technodef", icon: "Sparkles" }
  ]
};

export const ABOUT_THE_BOOK = {
  paragraphs: [
    "Wilting of Words is a work of literary fiction that explores the life, dreams, struggles, and voice of Aratrika, a young girl whose writing becomes a powerful means of confronting the world around her.",
    "Set against the realities of family, education, social expectations, and inequality, the story follows Aratrika as she discovers the strength of her own words. Her journey raises questions about how society treats young voices, how prejudice can shape lives, and how a person's ideas can survive even when the person is no longer there.",
    "At its heart, Wilting of Words is a story about voice, memory, injustice, ambition, and the enduring power of writing."
  ],
  quote: "Sometimes words seem to disappear—but the right words can remain long after their writer is gone.",
  
  // Requirement 4: Key Characters & Perspectives
  characterDossier: [
    {
      name: "Aratrika",
      role: "The Voice & Visionary",
      description: "The writer who turns her struggles, dreams, and convictions into a powerful voice."
    },
    {
      name: "Krittika",
      role: "The Successor",
      description: "The classmate whose journey transforms from observer to a leader carrying Aratrika’s legacy."
    },
    {
      name: "Prangik",
      role: "The Preserver",
      description: "The admirer of Aratrika’s writing who later helps preserve and bring her words to the wider world."
    },
    {
      name: "Mr. & Mrs. Saha",
      role: "The Family & Society",
      description: "Aratrika’s parents, representing the complicated influence of family, expectations, and society."
    }
  ],
  
  // Requirement 5: Format and Soundtrack pairing removed
  editionSpecs: [
    { label: "Publisher", value: "Technodef Literary Press" },
    { label: "Genre", value: "Literary Fiction / Social Drama" },
    { label: "Author", value: "Pratyay Saha" },
    { label: "Origin", value: "Chakdaha, West Bengal" }
  ]
};

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "Title & Inscription",
    subtitle: "Technodef Literary Archive Edition",
    pages: [
      {
        pageNumber: 1,
        text: `WILTING OF WORDS\n\nA Novel\nby Pratyay Saha\n\nSome words fade with time.\nOthers wait for someone to carry them.\n\nPublished by TECHNODEF\nHeritage Digital Edition\n\nDedicated to every unspoken thought that refused to die in silence.`,
        verse: `"To every unspoken tremor of the heart that found a sanctuary in ink."`,
        themeNote: "Opening Inscription"
      },
      {
        pageNumber: 2,
        text: `PROLOGUE: THE SILENT COURTYARD\n\nThere is a peculiar fragrance that clings to old red oxide floors right before the Nor'wester strikes. A mingling of scorched dust, wet jasmine, and the petrichor of forgotten years.\n\nIn the quiet ancestral house at Chakdaha, Aratrika stood by the carved mahogany lattice. In her trembling hands lay a brittle diary with yellowed edges. The letters inside were faint—written in sepia fountain ink that had slowly wilted under thirty seasons of humidity and heartbreak.\n\n"If you are reading this," the first entry whispered, "it means the silence in this house has finally found its voice."`,
        verse: `"Language does not die because of silence; it wilts when there is no one left to listen."`,
        themeNote: "Atmospheric Introduction"
      }
    ]
  },
  {
    id: 2,
    title: "Chapter I: Whispers in the Verandah",
    subtitle: "The Awakening of Memories",
    pages: [
      {
        pageNumber: 3,
        text: `Aratrika had always believed that the human voice was a fragile vessel. When her grandmother stopped speaking after the Great Flood of 1978, the villagers thought grief had paralyzed her vocal cords. But as Aratrika turned the second page, she uncovered the truth.\n\n"We do not fall silent out of weakness," Grandma's cursive read. "We silence ourselves because some truths are too heavy for words to carry without breaking."\n\nOutside, the gentle hum of an afternoon tanpura resonated from the neighbouring music academy, blending seamlessly with the rustling mango leaves.`,
        verse: `"In the quietest rooms, history is written not with drums, but with teardrops on paper."`,
        themeNote: "Memory & Heritage"
      },
      {
        pageNumber: 4,
        text: `As twilight settled over the riverbank, the distant sound of conch shells announced the evening rituals. Aratrika traced the dried bougainvillea petals pressed between the pages of the chronicle.\n\nShe remembered her school days in Nadia—how reciting classical verses in the morning assembly had once given her an invincible warmth. Why had she let the corporate hustle in the metropolis silence her poetic soul? Why had she allowed her own words to wilt?\n\nShe took a deep breath, dipped her fountain pen into indigo ink, and made her first marginal notation: 'I am listening.'`,
        verse: `"Return to the root, and the dried branch shall put forth emerald leaves once more."`,
        themeNote: "Identity & Awakening"
      }
    ]
  },
  {
    id: 3,
    title: "Chapter II: Terracotta Shadows",
    subtitle: "Art, Pain and Immortal Craft",
    pages: [
      {
        pageNumber: 5,
        text: `The following morning, Aratrika took the local train through the countryside. The red soil smelled of ancient fired terracotta. Looking at the carvings of the historic temple ruins, she realized that every artisan had poured their unspoken agony into clay.\n\nThe burnt tiles had withstood centuries of torrential monsoons, invasions, and historical decay. Yet the faces carved into the bricks—dancers, warriors, weeping mothers—still radiated life.\n\n"Art is the only rebellion that does not shed blood," Pratyay writes through the protagonist’s journal. "It is the only weapon that conquers mortality without taking a life."`,
        verse: `"Clay in the kiln forgets its weakness to become a monument of eternity."`,
        themeNote: "Terracotta Resilience"
      },
      {
        pageNumber: 6,
        text: `Sitting beneath an ancient tree near the temple ruins, Aratrika unscrewed her fountain pen. A single drop of turquoise ink bloomed upon the pristine white sheet of her sketchbook.\n\nFor the first time in ten years, she was not writing a project proposal or an email. She was writing the chronicle of her ancestors—the silent weavers, the boatmen singing folk melodies across the river, the brave thinkers who fought for illumination.\n\nThe wilting of words was reversing. Every syllable was drinking light.`,
        verse: `"When ink touches truth, silence turns into a roaring symphony."`,
        themeNote: "Catharsis & Creation"
      }
    ]
  },
  {
    id: 4,
    title: "Chapter III: The Monsoon Dialogue",
    subtitle: "Healing the Generational Rift",
    pages: [
      {
        pageNumber: 7,
        text: `Rain is never merely weather; it is an emotional architecture. As the torrential clouds broke over Chakdaha, Aratrika returned home drenched, her sketchbook securely wrapped in protective cloth.\n\nHer father looked up from his reading glasses. He saw the fire in her eyes—the same radiance he had seen before the long silence took hold.\n\n"You found it, didn't you?" he asked quietly.\n"I didn't just find the diary, Baba," she replied softly. "I found my voice."`,
        verse: `"The rain washes away the dust of neglect, revealing the gold that was always there."`,
        themeNote: "Reconciliation"
      },
      {
        pageNumber: 8,
        text: `EPILOGUE: THE UNWILTING FLOWER\n\nWords do not truly die. They sleep in the folds of old letters, they echo in the lullabies sung across quiet hamlets, and they awaken when a passionate youth dares to write them down without fear.\n\nPratyay Saha's 'Wilting of Words' stands as a testament that rich literary heritage is not a museum relic—it is a living, breathing pulse in the hands of the new generation.\n\nTo read is to remember. To write is to live forever.\n\n— TECHNODEF LITERARY PRESS, CHAKDAHA`,
        verse: `"Stand tall like the banyan, speak true like the river, and let your words bloom eternal."`,
        themeNote: "Final Reflection"
      }
    ]
  }
];

export const FAMOUS_QUOTES: Quote[] = [
  {
    id: "q1",
    text: "Sometimes words seem to disappear—but the right words can remain long after their writer is gone.",
    speaker: "Wilting of Words",
    chapter: "Core Inscription",
    theme: "Immortal Voice"
  },
  {
    id: "q2",
    text: "Some voices are silenced in life, but their words live louder than ever.",
    speaker: "Aratrika",
    chapter: "Prologue",
    theme: "Immortal Voice"
  },
  {
    id: "q3",
    text: "We do not fall silent out of weakness; we silence ourselves because some truths are too heavy for words to carry without breaking.",
    speaker: "Aratrika’s Reflections",
    chapter: "Chapter I",
    theme: "Truth & Silence"
  },
  {
    id: "q4",
    text: "Art is the only rebellion that does not shed blood, yet reshapes centuries of human consciousness.",
    speaker: "Pratyay Saha",
    chapter: "Chapter II",
    theme: "Creative Rebellion"
  },
  {
    id: "q5",
    text: "Clay in the kiln forgets its fragility to become a monument of eternity.",
    speaker: "Temple Artisan Monologue",
    chapter: "Chapter III",
    theme: "Resilience"
  }
];
