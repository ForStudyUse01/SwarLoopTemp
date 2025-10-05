import React from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Clock, User, Share2 } from 'lucide-react';

export default function ArticleDetail() {
  const { id } = useParams();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center">
        <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            Understanding Your Emotions Through Music
          </h1>
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <User className="h-4 w-4 mr-1" />
            <span className="mr-4">Dr. Sarah Johnson</span>
            <Clock className="h-4 w-4 mr-1" />
            <span>5 min read</span>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      <div className="card">
        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            Music has a profound impact on our emotional well-being. Research shows that different types of music can help regulate our emotions and improve our mental health.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How Music Affects Emotions</h2>
          
          <p className="text-gray-700 mb-4">
            Music activates multiple areas of the brain simultaneously, including the amygdala (emotional processing), hippocampus (memory formation), and prefrontal cortex (executive functions and emotional regulation).
          </p>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Factors:</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Rhythm and Tempo:</strong> Fast-paced music can energize us, while slow, steady rhythms can calm us down.</li>
            <li><strong>Melody and Harmony:</strong> Major keys tend to sound happy and uplifting, while minor keys can evoke sadness or introspection.</li>
            <li><strong>Lyrics:</strong> The words in songs can resonate with our feelings and provide comfort or motivation.</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Using Music for Emotional Regulation</h2>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Practical Tips:</h3>
            <ul className="space-y-2">
              <li><strong>When feeling anxious:</strong> Try calming, ambient music or nature sounds</li>
              <li><strong>When feeling sad:</strong> Listen to music that validates your emotions, then gradually shift to more uplifting songs</li>
              <li><strong>When feeling angry:</strong> Start with intense music to release energy, then transition to calming music</li>
              <li><strong>When feeling stressed:</strong> Meditation music or classical pieces can help reduce stress</li>
            </ul>
          </div>
          
          <p className="text-gray-700">
            Remember, music is a powerful tool for emotional regulation, but it's not a substitute for professional mental health care when needed. Use it as part of a holistic approach to your mental well-being.
          </p>
        </div>
      </div>
    </div>
  );
}
