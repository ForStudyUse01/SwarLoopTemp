import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@swarloop.com' },
    update: {},
    create: {
      email: 'admin@swarloop.com',
      password: adminPassword,
      displayName: 'SwarLoop Admin',
      role: 'ADMIN',
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: true
      },
      consentFlags: {
        analytics: true,
        voiceProcessing: false,
        emailNotifications: true
      }
    }
  });

  // Create test user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@swarloop.com' },
    update: {},
    create: {
      email: 'user@swarloop.com',
      password: userPassword,
      displayName: 'Test User',
      role: 'USER',
      preferences: {
        theme: 'dark',
        language: 'en',
        notifications: true
      },
      consentFlags: {
        analytics: true,
        voiceProcessing: false,
        emailNotifications: false
      }
    }
  });

  console.log('✅ Users created');

  // Create sample music
  const sampleMusic = [
    {
      title: 'Peaceful Morning',
      artist: 'Nature Sounds',
      album: 'Calm Collection',
      duration: 180,
      audioUrl: 'https://example.com/audio/peaceful-morning.mp3',
      genreTags: ['ambient', 'nature', 'meditation'],
      moodTags: ['calm', 'peaceful', 'relaxing'],
      audioFeatures: {
        tempo: 60,
        key: 'C',
        valence: 0.8,
        energy: 0.3,
        danceability: 0.2
      },
      language: 'en'
    },
    {
      title: 'Energetic Beat',
      artist: 'Upbeat Artists',
      album: 'Energy Boost',
      duration: 240,
      audioUrl: 'https://example.com/audio/energetic-beat.mp3',
      genreTags: ['electronic', 'pop', 'dance'],
      moodTags: ['energetic', 'uplifting', 'happy'],
      audioFeatures: {
        tempo: 128,
        key: 'G',
        valence: 0.9,
        energy: 0.8,
        danceability: 0.9
      },
      language: 'en'
    },
    {
      title: 'Melancholic Melody',
      artist: 'Sad Songs Inc',
      album: 'Emotional Journey',
      duration: 200,
      audioUrl: 'https://example.com/audio/melancholic-melody.mp3',
      genreTags: ['indie', 'folk', 'acoustic'],
      moodTags: ['melancholic', 'introspective', 'sad'],
      audioFeatures: {
        tempo: 70,
        key: 'Am',
        valence: 0.2,
        energy: 0.3,
        danceability: 0.1
      },
      language: 'en'
    },
    {
      title: 'Meditation Bell',
      artist: 'Zen Masters',
      album: 'Mindfulness',
      duration: 300,
      audioUrl: 'https://example.com/audio/meditation-bell.mp3',
      genreTags: ['meditation', 'spiritual', 'ambient'],
      moodTags: ['calm', 'meditative', 'peaceful'],
      audioFeatures: {
        tempo: 40,
        key: 'F',
        valence: 0.7,
        energy: 0.1,
        danceability: 0.0
      },
      language: 'en'
    },
    {
      title: 'Happy Tune',
      artist: 'Joyful Musicians',
      album: 'Sunshine Songs',
      duration: 160,
      audioUrl: 'https://example.com/audio/happy-tune.mp3',
      genreTags: ['pop', 'happy', 'upbeat'],
      moodTags: ['happy', 'joyful', 'uplifting'],
      audioFeatures: {
        tempo: 120,
        key: 'C',
        valence: 0.95,
        energy: 0.7,
        danceability: 0.8
      },
      language: 'en'
    }
  ];

  for (const music of sampleMusic) {
    await prisma.music.upsert({
      where: { id: music.title }, // Using title as unique identifier for seeding
      update: {},
      create: {
        ...music,
        uploadedBy: admin.id
      }
    });
  }

  console.log('✅ Sample music created');

  // Create sample articles
  const sampleArticles = [
    {
      title: 'Understanding Your Emotions Through Music',
      content: `# Understanding Your Emotions Through Music

Music has a profound impact on our emotional well-being. Research shows that different types of music can help regulate our emotions and improve our mental health.

## How Music Affects Emotions

1. **Rhythm and Tempo**: Fast-paced music can energize us, while slow, steady rhythms can calm us down.
2. **Melody and Harmony**: Major keys tend to sound happy and uplifting, while minor keys can evoke sadness or introspection.
3. **Lyrics**: The words in songs can resonate with our feelings and provide comfort or motivation.

## Using Music for Emotional Regulation

- **When feeling anxious**: Try calming, ambient music or nature sounds
- **When feeling sad**: Listen to music that validates your emotions, then gradually shift to more uplifting songs
- **When feeling angry**: Start with intense music to release energy, then transition to calming music
- **When feeling stressed**: Meditation music or classical pieces can help reduce stress

Remember, music is a powerful tool for emotional regulation, but it's not a substitute for professional mental health care when needed.`,
      summary: 'Learn how music can help regulate emotions and improve mental well-being.',
      author: 'Dr. Sarah Johnson',
      tags: ['emotions', 'music therapy', 'mental health', 'wellbeing']
    },
    {
      title: 'The Science of Mood and Music',
      content: `# The Science of Mood and Music

Music therapy is a well-established field that uses music to address physical, emotional, cognitive, and social needs of individuals.

## Neurological Effects

Music activates multiple areas of the brain simultaneously:
- **Amygdala**: Processes emotional responses
- **Hippocampus**: Involved in memory formation
- **Prefrontal Cortex**: Controls executive functions and emotional regulation

## Therapeutic Applications

1. **Anxiety Reduction**: Slow, steady rhythms can activate the parasympathetic nervous system
2. **Depression Management**: Uplifting music can increase dopamine production
3. **Stress Relief**: Calming music can reduce cortisol levels
4. **Pain Management**: Music can distract from pain and reduce perceived intensity

## Choosing the Right Music

The key is to match music to your current emotional state and gradually guide it toward your desired emotional state.`,
      summary: 'Explore the scientific basis for how music affects our mood and mental state.',
      author: 'Prof. Michael Chen',
      tags: ['science', 'music therapy', 'neurology', 'research']
    },
    {
      title: 'Building Healthy Music Habits',
      content: `# Building Healthy Music Habits

Creating a sustainable relationship with music for emotional well-being requires intention and awareness.

## Daily Music Practices

### Morning Routine
- Start with gentle, uplifting music to set a positive tone
- Avoid jarring or aggressive music first thing in the morning
- Consider instrumental music to avoid overwhelming lyrics

### Work and Focus
- Use ambient or instrumental music for concentration
- Avoid music with lyrics when doing complex tasks
- Experiment with different genres to find what helps you focus

### Evening Wind-down
- Choose calming, slower-paced music
- Create a consistent bedtime music routine
- Use music as a signal to your body that it's time to relax

## Creating Playlists for Different Moods

1. **Energy Boost**: Upbeat, fast-paced songs
2. **Calm Down**: Slow, peaceful, ambient music
3. **Processing Emotions**: Songs that match your current feelings
4. **Motivation**: Inspirational and empowering music

## Mindful Listening

Practice active listening by:
- Paying attention to how different songs make you feel
- Noticing physical responses (heart rate, breathing)
- Being aware of emotional changes
- Taking breaks when music becomes overwhelming`,
      summary: 'Learn how to develop healthy music listening habits for better emotional well-being.',
      author: 'Lisa Martinez',
      tags: ['habits', 'mindfulness', 'wellbeing', 'lifestyle']
    }
  ];

  for (const article of sampleArticles) {
    await prisma.article.upsert({
      where: { id: article.title },
      update: {},
      create: article
    });
  }

  console.log('✅ Sample articles created');

  // Create sample meditations
  const sampleMeditations = [
    {
      title: '5-Minute Breathing Meditation',
      duration: 300,
      audioUrl: 'https://example.com/audio/breathing-meditation.mp3',
      difficulty: 'beginner'
    },
    {
      title: 'Body Scan Relaxation',
      duration: 600,
      audioUrl: 'https://example.com/audio/body-scan.mp3',
      difficulty: 'intermediate'
    },
    {
      title: 'Loving-Kindness Meditation',
      duration: 900,
      audioUrl: 'https://example.com/audio/loving-kindness.mp3',
      difficulty: 'intermediate'
    },
    {
      title: 'Deep Sleep Meditation',
      duration: 1200,
      audioUrl: 'https://example.com/audio/sleep-meditation.mp3',
      difficulty: 'beginner'
    },
    {
      title: 'Advanced Mindfulness',
      duration: 1800,
      audioUrl: 'https://example.com/audio/advanced-mindfulness.mp3',
      difficulty: 'advanced'
    }
  ];

  for (const meditation of sampleMeditations) {
    await prisma.meditation.upsert({
      where: { id: meditation.title },
      update: {},
      create: meditation
    });
  }

  console.log('✅ Sample meditations created');

  // Create sample playlists
  const calmPlaylist = await prisma.playlist.create({
    data: {
      name: 'Calm & Peaceful',
      description: 'A collection of calming songs for relaxation and stress relief',
      isPublic: true,
      ownerId: admin.id,
      tracks: {
        create: [
          { musicId: (await prisma.music.findFirst({ where: { title: 'Peaceful Morning' } }))!.id, order: 0 },
          { musicId: (await prisma.music.findFirst({ where: { title: 'Meditation Bell' } }))!.id, order: 1 }
        ]
      }
    }
  });

  const energeticPlaylist = await prisma.playlist.create({
    data: {
      name: 'Energy Boost',
      description: 'Upbeat songs to energize and motivate',
      isPublic: true,
      ownerId: admin.id,
      tracks: {
        create: [
          { musicId: (await prisma.music.findFirst({ where: { title: 'Energetic Beat' } }))!.id, order: 0 },
          { musicId: (await prisma.music.findFirst({ where: { title: 'Happy Tune' } }))!.id, order: 1 }
        ]
      }
    }
  });

  console.log('✅ Sample playlists created');

  // Create sample mood events
  await prisma.moodEvent.createMany({
    data: [
      {
        userId: user.id,
        source: 'SELF_REPORT',
        label: 'happy',
        score: 8,
        contextText: 'Feeling great today!'
      },
      {
        userId: user.id,
        source: 'SELF_REPORT',
        label: 'calm',
        score: 7,
        contextText: 'Just finished meditation'
      },
      {
        userId: user.id,
        source: 'TEXT_ANALYSIS',
        label: 'anxious',
        score: 6,
        contextText: 'Feeling a bit worried about work'
      }
    ]
  });

  console.log('✅ Sample mood events created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\nDemo credentials:');
  console.log('Admin: admin@swarloop.com / admin123');
  console.log('User: user@swarloop.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
