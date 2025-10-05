import React from 'react';
import { useQuery } from 'react-query';
import { Users, Music, BookOpen, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { adminAPI } from '../services/api';

export default function AdminDashboard() {
  const { data: metrics, isLoading } = useQuery(
    'admin-metrics',
    () => adminAPI.getMetrics(),
    {
      select: (response) => response.data.data,
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: metrics?.users?.total || 0,
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Users',
      value: metrics?.users?.active || 0,
      change: '+8%',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Music Tracks',
      value: metrics?.content?.music || 0,
      change: '+5%',
      icon: Music,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Articles',
      value: metrics?.content?.articles || 0,
      change: '+3%',
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of platform metrics and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <BarChart3 className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Mood Events (7 days)</p>
                <p className="text-sm text-gray-600">User mood submissions</p>
              </div>
              <div className="text-2xl font-bold text-primary-600">
                {metrics?.activity?.moodEventsLast7Days || 0}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Recommendations (7 days)</p>
                <p className="text-sm text-gray-600">AI-generated suggestions</p>
              </div>
              <div className="text-2xl font-bold text-secondary-600">
                {metrics?.activity?.recommendationsLast7Days || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Mood Distribution</h2>
            <TrendingUp className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-3">
            {metrics?.insights?.moodDistribution?.map((mood: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {mood.label}
                </span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(mood._count.label / 100) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{mood._count.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Genres */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Genres</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {metrics?.insights?.topGenres?.map((genre: any, index: number) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {genre.count}
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {genre.genre}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
