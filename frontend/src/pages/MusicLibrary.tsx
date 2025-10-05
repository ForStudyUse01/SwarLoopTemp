import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Search, Filter, Play, Heart, Clock } from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';
import { musicAPI } from '../services/api';

export default function MusicLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const { playTrack } = useMusic();

  const { data: musicData, isLoading } = useQuery(
    ['music', searchTerm, selectedGenre, selectedMood],
    () => musicAPI.getMusic({
      search: searchTerm,
      genre: selectedGenre,
      mood: selectedMood,
      limit: 20
    }),
    {
      select: (response) => response.data,
    }
  );

  const genres = ['Pop', 'Rock', 'Electronic', 'Classical', 'Jazz', 'Hip-Hop', 'Ambient'];
  const moods = ['Happy', 'Sad', 'Calm', 'Energetic', 'Melancholic', 'Peaceful', 'Uplifting'];

  const handlePlayTrack = (track: any) => {
    playTrack(track);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Music Library</h1>
        <p className="text-gray-600 mt-2">Discover and play music from our curated collection</p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search songs, artists, or albums..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="input"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="input"
            >
              <option value="">All Moods</option>
              {moods.map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Music Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {musicData?.data?.map((track: any) => (
            <div key={track.id} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <Play className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 truncate">{track.title}</h3>
              <p className="text-sm text-gray-600 truncate">{track.artist}</p>
              {track.album && (
                <p className="text-xs text-gray-500 truncate">{track.album}</p>
              )}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(track.duration)}
                </div>
                <button
                  onClick={() => handlePlayTrack(track)}
                  className="btn-primary py-1 px-3 text-sm"
                >
                  <Play className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {track.moodTags.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {musicData?.data?.length === 0 && (
        <div className="text-center py-12">
          <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No music found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
