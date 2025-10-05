import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Heart, 
  Music, 
  TrendingUp, 
  Calendar,
  Play,
  Plus,
  Brain,
  Activity,
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';
import { musicAPI, recommendationAPI } from '../services/api';

export default function Dashboard() {
  const { playTrack } = useMusic();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Fetch recent music
  const { data: recentMusic } = useQuery(
    'recent-music',
    () => musicAPI.getMusic({ limit: 6 }),
    {
      select: (response) => response.data.data,
    }
  );

  // Fetch recommendations
  const { data: recommendations, refetch: refetchRecommendations } = useQuery(
    'recommendations',
    () => recommendationAPI.getRecommendations({
      moodEvent: selectedMood ? {
        source: 'SELF_REPORT',
        label: selectedMood,
        score: 7
      } : undefined,
      limit: 6
    }),
    {
      enabled: !!selectedMood,
      select: (response) => response.data.data.recommendations,
    }
  );

  const moods = [
    { id: 'happy', label: 'Happy', emoji: '😊', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'sad', label: 'Sad', emoji: '😢', color: 'bg-blue-100 text-blue-800' },
    { id: 'angry', label: 'Angry', emoji: '😠', color: 'bg-red-100 text-red-800' },
    { id: 'anxious', label: 'Anxious', emoji: '😰', color: 'bg-orange-100 text-orange-800' },
    { id: 'calm', label: 'Calm', emoji: '😌', color: 'bg-green-100 text-green-800' },
    { id: 'energetic', label: 'Energetic', emoji: '⚡', color: 'bg-purple-100 text-purple-800' },
  ];

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    refetchRecommendations();
  };

  const handlePlayTrack = (track: any) => {
    playTrack(track);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-primary-100 text-lg">
              How are you feeling today? Let's find the perfect music for your mood.
            </p>
          </div>
          <div className="hidden md:block">
            <Brain className="h-24 w-24 text-primary-200" />
          </div>
        </div>
      </div>

      {/* Mood Selection */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">How are you feeling?</h2>
          <Sparkles className="h-6 w-6 text-primary-600" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedMood === mood.id
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
              }`}
            >
              <div className="text-3xl mb-2">{mood.emoji}</div>
              <div className="text-sm font-medium text-gray-700">{mood.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {selectedMood && recommendations && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Recommended for {moods.find(m => m.id === selectedMood)?.label}
            </h2>
            <Link
              to="/recommendations"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 6).map((track: any) => (
              <div key={track.id} className="recommendation-card">
                <div className="track-info">
                  <div className="track-artwork">
                    <Music className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{track.title}</h3>
                    <p className="text-sm text-gray-600">{track.artist}</p>
                    <div className="flex items-center mt-2">
                      <div className="track-score">{track.reason}</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handlePlayTrack(track)}
                  className="mt-4 w-full btn-primary py-2 text-sm"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Play
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/music"
          className="card hover:shadow-lg transition-shadow duration-300 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
              <Music className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Music Library</h3>
              <p className="text-gray-600">Browse all tracks</p>
            </div>
          </div>
        </Link>

        <Link
          to="/playlists"
          className="card hover:shadow-lg transition-shadow duration-300 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-secondary-100 rounded-lg group-hover:bg-secondary-200 transition-colors">
              <Plus className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Playlist</h3>
              <p className="text-gray-600">Make your own mix</p>
            </div>
          </div>
        </Link>

        <Link
          to="/meditations"
          className="card hover:shadow-lg transition-shadow duration-300 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-accent-100 rounded-lg group-hover:bg-accent-200 transition-colors">
              <Activity className="h-6 w-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Meditations</h3>
              <p className="text-gray-600">Guided sessions</p>
            </div>
          </div>
        </Link>

        <Link
          to="/articles"
          className="card hover:shadow-lg transition-shadow duration-300 group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Articles</h3>
              <p className="text-gray-600">Wellness content</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Music */}
      {recentMusic && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recently Added</h2>
            <Link
              to="/music"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentMusic.map((track: any) => (
              <div key={track.id} className="recommendation-card">
                <div className="track-info">
                  <div className="track-artwork">
                    <Music className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{track.title}</h3>
                    <p className="text-sm text-gray-600">{track.artist}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {track.moodTags.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handlePlayTrack(track)}
                  className="mt-4 w-full btn-primary py-2 text-sm"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Play
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="p-3 bg-primary-100 rounded-lg w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">24</h3>
          <p className="text-gray-600">Mood sessions this week</p>
        </div>

        <div className="card text-center">
          <div className="p-3 bg-secondary-100 rounded-lg w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <Heart className="h-6 w-6 text-secondary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">156</h3>
          <p className="text-gray-600">Songs discovered</p>
        </div>

        <div className="card text-center">
          <div className="p-3 bg-accent-100 rounded-lg w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-accent-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">7</h3>
          <p className="text-gray-600">Days streak</p>
        </div>
      </div>
    </div>
  );
}
