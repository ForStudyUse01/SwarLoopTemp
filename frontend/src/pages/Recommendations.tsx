import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Brain, Play, RefreshCw, Sparkles } from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';
import { recommendationAPI } from '../services/api';

export default function Recommendations() {
  const [selectedMood, setSelectedMood] = useState('happy');
  const { playTrack } = useMusic();

  const { data: recommendations, isLoading, refetch } = useQuery(
    ['recommendations', selectedMood],
    () => recommendationAPI.getRecommendations({
      moodEvent: {
        source: 'SELF_REPORT',
        label: selectedMood,
        score: 7
      },
      limit: 12
    }),
    {
      select: (response) => response.data.data,
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

  const handlePlayTrack = (track: any) => {
    playTrack(track);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
        <p className="text-gray-600 mt-2">Get personalized music suggestions based on your mood</p>
      </div>

      {/* Mood Selection */}
      <div className="card">
        <div className="flex items-center mb-6">
          <Brain className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">How are you feeling?</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
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
        <button
          onClick={() => refetch()}
          className="mt-4 btn-primary inline-flex items-center"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Get New Recommendations
        </button>
      </div>

      {/* Recommendations */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="loading-spinner"></div>
        </div>
      ) : recommendations ? (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Sparkles className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Recommended for {moods.find(m => m.id === selectedMood)?.label}
              </h2>
            </div>
            <div className="text-sm text-gray-600">
              {recommendations.recommendations?.length || 0} tracks
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.recommendations?.map((track: any) => (
              <div key={track.id} className="recommendation-card">
                <div className="track-info">
                  <div className="track-artwork">
                    <Play className="h-6 w-6 text-gray-400" />
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
      ) : null}
    </div>
  );
}
