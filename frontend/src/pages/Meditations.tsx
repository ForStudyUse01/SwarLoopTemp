import React from 'react';
import { Play, Clock, Activity, Filter } from 'lucide-react';

export default function Meditations() {
  const meditations = [
    {
      id: '1',
      title: '5-Minute Breathing Meditation',
      duration: 300,
      difficulty: 'beginner',
      description: 'A short guided breathing exercise to center yourself'
    },
    {
      id: '2',
      title: 'Body Scan Relaxation',
      duration: 600,
      difficulty: 'intermediate',
      description: 'Progressive relaxation technique for deep calm'
    },
    {
      id: '3',
      title: 'Loving-Kindness Meditation',
      duration: 900,
      difficulty: 'intermediate',
      description: 'Cultivate compassion and positive emotions'
    },
    {
      id: '4',
      title: 'Deep Sleep Meditation',
      duration: 1200,
      difficulty: 'beginner',
      description: 'Guided meditation to help you fall asleep'
    },
    {
      id: '5',
      title: 'Advanced Mindfulness',
      duration: 1800,
      difficulty: 'advanced',
      description: 'Deep mindfulness practice for experienced practitioners'
    }
  ];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guided Meditations</h1>
          <p className="text-gray-600 mt-2">Find peace and mindfulness with our guided meditation sessions</p>
        </div>
        <div className="flex items-center space-x-2">
          <select className="input">
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button className="btn-outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meditations.map((meditation) => (
          <div key={meditation.id} className="card hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-accent-100 rounded-lg">
                <Activity className="h-6 w-6 text-accent-600" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="font-semibold text-gray-900">{meditation.title}</h3>
                <p className="text-sm text-gray-600">{meditation.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {formatDuration(meditation.duration)}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(meditation.difficulty)}`}>
                {meditation.difficulty}
              </span>
            </div>
            
            <button className="w-full btn-primary">
              <Play className="mr-2 h-4 w-4" />
              Start Meditation
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
