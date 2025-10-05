from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import pipeline, AutoTokenizer, AutoModel
import torch
import librosa
import io
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SwarLoop ML Service",
    description="Mood detection and music recommendation ML service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
sentiment_pipeline = None
emotion_pipeline = None
music_features = None
music_embeddings = None

class MoodAnalysisRequest(BaseModel):
    text: str
    confidence_threshold: float = 0.5

class MoodAnalysisResponse(BaseModel):
    emotions: Dict[str, float]
    dominant_emotion: str
    confidence: float
    mood_score: float  # 1-10 scale

class MusicRecommendationRequest(BaseModel):
    user_id: str
    mood_emotions: Dict[str, float]
    limit: int = 10

class MusicRecommendationResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    model_version: str
    reasoning: str

class AudioMoodRequest(BaseModel):
    audio_features: Dict[str, float]  # Pre-computed audio features

class AudioMoodResponse(BaseModel):
    emotions: Dict[str, float]
    dominant_emotion: str
    confidence: float

@app.on_event("startup")
async def startup_event():
    """Initialize ML models on startup"""
    global sentiment_pipeline, emotion_pipeline, music_features, music_embeddings
    
    try:
        logger.info("Loading sentiment analysis model...")
        sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
            return_all_scores=True
        )
        
        logger.info("Loading emotion classification model...")
        emotion_pipeline = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            return_all_scores=True
        )
        
        logger.info("Loading music features...")
        # In production, load from database
        music_features = load_music_features()
        music_embeddings = compute_music_embeddings(music_features)
        
        logger.info("ML service initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize ML service: {e}")
        raise

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": {
            "sentiment": sentiment_pipeline is not None,
            "emotion": emotion_pipeline is not None,
            "music_features": music_features is not None
        }
    }

@app.post("/analyze-text-mood", response_model=MoodAnalysisResponse)
async def analyze_text_mood(request: MoodAnalysisRequest):
    """Analyze mood from text input"""
    try:
        if not emotion_pipeline or not sentiment_pipeline:
            raise HTTPException(status_code=503, detail="ML models not loaded")
        
        # Get emotion analysis
        emotion_results = emotion_pipeline(request.text)
        emotions = {result['label']: result['score'] for result in emotion_results}
        
        # Get sentiment analysis
        sentiment_results = sentiment_pipeline(request.text)
        sentiment_scores = {result['label']: result['score'] for result in sentiment_results}
        
        # Combine emotion and sentiment
        combined_emotions = combine_emotion_sentiment(emotions, sentiment_scores)
        
        # Find dominant emotion
        dominant_emotion = max(combined_emotions, key=combined_emotions.get)
        confidence = combined_emotions[dominant_emotion]
        
        # Convert to mood score (1-10)
        mood_score = emotion_to_mood_score(dominant_emotion, confidence)
        
        return MoodAnalysisResponse(
            emotions=combined_emotions,
            dominant_emotion=dominant_emotion,
            confidence=confidence,
            mood_score=mood_score
        )
        
    except Exception as e:
        logger.error(f"Error in text mood analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-audio-mood", response_model=AudioMoodResponse)
async def analyze_audio_mood(request: AudioMoodRequest):
    """Analyze mood from audio features"""
    try:
        audio_features = request.audio_features
        
        # Map audio features to emotions
        emotions = audio_features_to_emotions(audio_features)
        
        # Find dominant emotion
        dominant_emotion = max(emotions, key=emotions.get)
        confidence = emotions[dominant_emotion]
        
        return AudioMoodResponse(
            emotions=emotions,
            dominant_emotion=dominant_emotion,
            confidence=confidence
        )
        
    except Exception as e:
        logger.error(f"Error in audio mood analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend-music", response_model=MusicRecommendationResponse)
async def recommend_music(request: MusicRecommendationRequest):
    """Generate music recommendations based on mood"""
    try:
        if music_features is None or music_embeddings is None:
            raise HTTPException(status_code=503, detail="Music features not loaded")
        
        # Get mood-based recommendations
        recommendations = get_mood_based_recommendations(
            request.mood_emotions,
            request.limit
        )
        
        return MusicRecommendationResponse(
            recommendations=recommendations,
            model_version="1.0.0",
            reasoning=f"Based on mood analysis: {list(request.mood_emotions.keys())}"
        )
        
    except Exception as e:
        logger.error(f"Error in music recommendation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-audio-features")
async def extract_audio_features(file: UploadFile = File(...)):
    """Extract audio features from uploaded audio file"""
    try:
        # Read audio file
        audio_data = await file.read()
        audio_io = io.BytesIO(audio_data)
        
        # Load audio with librosa
        y, sr = librosa.load(audio_io, sr=22050)
        
        # Extract features
        features = extract_audio_features_librosa(y, sr)
        
        return {
            "features": features,
            "duration": len(y) / sr,
            "sample_rate": sr
        }
        
    except Exception as e:
        logger.error(f"Error extracting audio features: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def combine_emotion_sentiment(emotions: Dict[str, float], sentiment: Dict[str, float]) -> Dict[str, float]:
    """Combine emotion and sentiment analysis results"""
    combined = emotions.copy()
    
    # Adjust based on sentiment
    if sentiment.get('POSITIVE', 0) > 0.5:
        # Boost positive emotions
        for emotion in ['joy', 'love', 'optimism']:
            if emotion in combined:
                combined[emotion] *= 1.2
    elif sentiment.get('NEGATIVE', 0) > 0.5:
        # Boost negative emotions
        for emotion in ['sadness', 'anger', 'fear']:
            if emotion in combined:
                combined[emotion] *= 1.2
    
    # Normalize scores
    total = sum(combined.values())
    if total > 0:
        combined = {k: v/total for k, v in combined.items()}
    
    return combined

def emotion_to_mood_score(emotion: str, confidence: float) -> float:
    """Convert emotion to mood score (1-10)"""
    emotion_scores = {
        'joy': 9,
        'love': 8,
        'optimism': 7,
        'neutral': 5,
        'sadness': 3,
        'anger': 2,
        'fear': 2,
        'surprise': 6
    }
    
    base_score = emotion_scores.get(emotion, 5)
    # Adjust based on confidence
    adjusted_score = base_score + (confidence - 0.5) * 2
    return max(1, min(10, adjusted_score))

def audio_features_to_emotions(features: Dict[str, float]) -> Dict[str, float]:
    """Map audio features to emotions"""
    emotions = {}
    
    # Valence (positive/negative emotion)
    valence = features.get('valence', 0.5)
    emotions['joy'] = valence
    emotions['sadness'] = 1 - valence
    
    # Energy (arousal level)
    energy = features.get('energy', 0.5)
    emotions['anger'] = energy * 0.7
    emotions['fear'] = energy * 0.3
    
    # Danceability
    danceability = features.get('danceability', 0.5)
    emotions['joy'] += danceability * 0.3
    
    # Normalize
    total = sum(emotions.values())
    if total > 0:
        emotions = {k: v/total for k, v in emotions.items()}
    
    return emotions

def extract_audio_features_librosa(y: np.ndarray, sr: int) -> Dict[str, float]:
    """Extract audio features using librosa"""
    features = {}
    
    # Tempo
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    features['tempo'] = float(tempo)
    
    # Spectral features
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    features['spectral_centroid'] = float(np.mean(spectral_centroids))
    
    # Zero crossing rate
    zcr = librosa.feature.zero_crossing_rate(y)[0]
    features['zero_crossing_rate'] = float(np.mean(zcr))
    
    # MFCC features
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    for i in range(13):
        features[f'mfcc_{i}'] = float(np.mean(mfccs[i]))
    
    # Rhythm features
    features['rhythm'] = float(np.std(librosa.beat.beat_track(y=y, sr=sr)[1]))
    
    # Energy
    features['energy'] = float(np.mean(librosa.feature.rms(y=y)[0]))
    
    # Valence and arousal (simplified mapping)
    features['valence'] = min(1.0, max(0.0, (features['spectral_centroid'] / 3000) * 0.5 + 0.5))
    features['arousal'] = min(1.0, max(0.0, features['energy'] * 2))
    
    return features

def load_music_features():
    """Load music features from database (simplified for demo)"""
    # In production, this would load from the database
    return {
        "sample_track_1": {
            "id": "sample_track_1",
            "title": "Calm Song",
            "artist": "Artist 1",
            "genre_tags": ["ambient", "calm"],
            "mood_tags": ["calm", "peaceful"],
            "audio_features": {
                "tempo": 60,
                "valence": 0.8,
                "energy": 0.3,
                "danceability": 0.2
            }
        },
        "sample_track_2": {
            "id": "sample_track_2",
            "title": "Energetic Song",
            "artist": "Artist 2",
            "genre_tags": ["electronic", "dance"],
            "mood_tags": ["energetic", "happy"],
            "audio_features": {
                "tempo": 128,
                "valence": 0.9,
                "energy": 0.8,
                "danceability": 0.9
            }
        }
    }

def compute_music_embeddings(features: Dict[str, Any]) -> np.ndarray:
    """Compute embeddings for music tracks"""
    embeddings = []
    track_ids = []
    
    for track_id, track_data in features.items():
        # Create feature vector
        feature_vector = [
            track_data['audio_features']['tempo'] / 200,  # Normalize tempo
            track_data['audio_features']['valence'],
            track_data['audio_features']['energy'],
            track_data['audio_features']['danceability']
        ]
        embeddings.append(feature_vector)
        track_ids.append(track_id)
    
    return np.array(embeddings), track_ids

def get_mood_based_recommendations(mood_emotions: Dict[str, float], limit: int) -> List[Dict[str, Any]]:
    """Get music recommendations based on mood emotions"""
    if music_features is None:
        return []
    
    # Find dominant emotion
    dominant_emotion = max(mood_emotions, key=mood_emotions.get)
    
    # Map emotions to mood tags
    emotion_to_mood_tags = {
        'joy': ['happy', 'uplifting', 'energetic'],
        'sadness': ['melancholic', 'introspective', 'calm'],
        'anger': ['calm', 'peaceful', 'meditative'],
        'fear': ['calm', 'peaceful', 'ambient'],
        'love': ['romantic', 'warm', 'uplifting'],
        'surprise': ['energetic', 'uplifting', 'happy']
    }
    
    target_mood_tags = emotion_to_mood_tags.get(dominant_emotion, ['neutral'])
    
    # Score tracks based on mood tag matches
    scored_tracks = []
    for track_id, track_data in music_features.items():
        score = 0
        matching_tags = set(track_data['mood_tags']) & set(target_mood_tags)
        score += len(matching_tags) * 0.5
        
        # Add audio feature similarity
        audio_features = track_data['audio_features']
        if dominant_emotion == 'joy':
            score += audio_features['valence'] * 0.3
            score += audio_features['energy'] * 0.2
        elif dominant_emotion == 'sadness':
            score += (1 - audio_features['valence']) * 0.3
            score += (1 - audio_features['energy']) * 0.2
        
        scored_tracks.append({
            'track_id': track_id,
            'title': track_data['title'],
            'artist': track_data['artist'],
            'score': score,
            'reason': f"Matches {list(matching_tags)} mood tags for {dominant_emotion}"
        })
    
    # Sort by score and return top results
    scored_tracks.sort(key=lambda x: x['score'], reverse=True)
    return scored_tracks[:limit]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
