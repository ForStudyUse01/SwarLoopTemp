import React from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Play, Plus, Music } from 'lucide-react';

export default function PlaylistDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Playlist Name</h1>
          <p className="text-gray-600 mt-2">Created by you • 12 tracks</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button className="btn-primary">
              <Play className="mr-2 h-4 w-4" />
              Play All
            </button>
            <button className="btn-outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Songs
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Sample tracks */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                <Music className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Song Title {i}</h3>
                <p className="text-sm text-gray-600">Artist Name</p>
              </div>
              <div className="text-sm text-gray-500">3:45</div>
              <button className="ml-4 p-2 hover:bg-gray-100 rounded-lg">
                <Play className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
