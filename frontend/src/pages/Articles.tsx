import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, User, ArrowRight } from 'lucide-react';

export default function Articles() {
  const articles = [
    {
      id: '1',
      title: 'Understanding Your Emotions Through Music',
      summary: 'Learn how music can help regulate emotions and improve mental well-being.',
      author: 'Dr. Sarah Johnson',
      readTime: '5 min read',
      tags: ['emotions', 'music therapy', 'mental health'],
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'The Science of Mood and Music',
      summary: 'Explore the scientific basis for how music affects our mood and mental state.',
      author: 'Prof. Michael Chen',
      readTime: '7 min read',
      tags: ['science', 'research', 'neurology'],
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      title: 'Building Healthy Music Habits',
      summary: 'Learn how to develop healthy music listening habits for better emotional well-being.',
      author: 'Lisa Martinez',
      readTime: '4 min read',
      tags: ['habits', 'wellbeing', 'lifestyle'],
      createdAt: '2024-01-05'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wellness Articles</h1>
        <p className="text-gray-600 mt-2">Expert insights on music therapy and emotional well-being</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link
            key={article.id}
            to={`/articles/${article.id}`}
            className="card hover:shadow-lg transition-shadow duration-300 group"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                <BookOpen className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{article.summary}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {article.author}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {article.readTime}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {article.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center text-primary-600 group-hover:text-primary-700">
              <span className="text-sm font-medium">Read more</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
