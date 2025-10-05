import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Music, Play, Users } from 'lucide-react';

export default function Playlists() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Playlists</h1>
          <p className="text-gray-600 mt-2">Create and manage your music collections</p>
        </div>
        <Link to="/playlists/new" className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New Playlist
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample playlists */}
        <div className="card hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Music className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900">My Favorites</h3>
              <p className="text-sm text-gray-600">12 tracks</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              Private
            </div>
            <button className="btn-primary py-1 px-3 text-sm">
              <Play className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Music className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900">Work Focus</h3>
              <p className="text-sm text-gray-600">8 tracks</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              Private
            </div>
            <button className="btn-primary py-1 px-3 text-sm">
              <Play className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
