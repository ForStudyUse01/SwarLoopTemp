import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Search, Plus, Edit, Trash2, Music, Play } from 'lucide-react';
import { musicAPI } from '../services/api';

export default function AdminMusic() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: musicData, isLoading } = useQuery(
    ['admin-music', searchTerm, currentPage],
    () => musicAPI.getMusic({
      search: searchTerm,
      page: currentPage,
      limit: 12
    }),
    {
      select: (response) => response.data,
    }
  );

  const handleDeleteMusic = async (musicId: string) => {
    if (window.confirm('Are you sure you want to delete this music track?')) {
      try {
        await musicAPI.deleteMusic(musicId);
        // Refetch data
      } catch (error) {
        console.error('Failed to delete music:', error);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Music Management</h1>
          <p className="text-gray-600 mt-2">Manage the music library and track metadata</p>
        </div>
        <button className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Music
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search music by title, artist, or album..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
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
                <Music className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 truncate">{track.title}</h3>
              <p className="text-sm text-gray-600 truncate">{track.artist}</p>
              {track.album && (
                <p className="text-xs text-gray-500 truncate">{track.album}</p>
              )}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center text-xs text-gray-500">
                  <Play className="h-3 w-3 mr-1" />
                  {formatDuration(track.duration)}
                </div>
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteMusic(track.id)}
                    className="p-1 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {track.moodTags.slice(0, 2).map((tag: string) => (
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
          <p className="text-gray-600">Try adjusting your search or add new music</p>
        </div>
      )}

      {/* Pagination */}
      {musicData?.pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, musicData.pagination.total)} of {musicData.pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= musicData.pagination.pages}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
