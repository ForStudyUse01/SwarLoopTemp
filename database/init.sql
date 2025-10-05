-- SwarLoop Database Initialization Script
-- This script sets up the initial database structure and sample data

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS swarloop;

-- Use the database
\c swarloop;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
-- These will be created by Prisma migrations, but we can add some additional ones here

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_music_title_search ON music USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_music_artist_search ON music USING gin(to_tsvector('english', artist));
CREATE INDEX IF NOT EXISTS idx_articles_title_search ON articles USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_articles_content_search ON articles USING gin(to_tsvector('english', content));

-- Array indexes for tags
CREATE INDEX IF NOT EXISTS idx_music_genre_tags ON music USING gin(genre_tags);
CREATE INDEX IF NOT EXISTS idx_music_mood_tags ON music USING gin(mood_tags);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING gin(tags);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_mood_events_user_timestamp ON mood_events(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_timestamp ON recommendations(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_user_timestamp ON events(user_id, timestamp DESC);
