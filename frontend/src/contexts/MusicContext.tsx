import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  audioUrl: string;
  genreTags: string[];
  moodTags: string[];
  audioFeatures?: any;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  ownerId: string;
  tracks: Array<{
    id: string;
    music: Track;
    order: number;
  }>;
  createdAt: string;
}

interface MusicState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentPlaylist: Playlist | null;
  queue: Track[];
  volume: number;
  currentTime: number;
  duration: number;
}

type MusicAction =
  | { type: 'PLAY_TRACK'; payload: Track }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_QUEUE'; payload: Track[] }
  | { type: 'ADD_TO_QUEUE'; payload: Track }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREVIOUS_TRACK' }
  | { type: 'SET_PLAYLIST'; payload: Playlist };

interface MusicContextType extends MusicState {
  playTrack: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  setTime: (time: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  addToQueue: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
  setPlaylist: (playlist: Playlist) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const initialState: MusicState = {
  currentTrack: null,
  isPlaying: false,
  currentPlaylist: null,
  queue: [],
  volume: 0.7,
  currentTime: 0,
  duration: 0,
};

function musicReducer(state: MusicState, action: MusicAction): MusicState {
  switch (action.type) {
    case 'PLAY_TRACK':
      return {
        ...state,
        currentTrack: action.payload,
        isPlaying: true,
      };
    case 'PAUSE':
      return {
        ...state,
        isPlaying: false,
      };
    case 'RESUME':
      return {
        ...state,
        isPlaying: true,
      };
    case 'STOP':
      return {
        ...state,
        currentTrack: null,
        isPlaying: false,
        currentTime: 0,
      };
    case 'SET_VOLUME':
      return {
        ...state,
        volume: Math.max(0, Math.min(1, action.payload)),
      };
    case 'SET_TIME':
      return {
        ...state,
        currentTime: action.payload,
      };
    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload,
      };
    case 'SET_QUEUE':
      return {
        ...state,
        queue: action.payload,
      };
    case 'ADD_TO_QUEUE':
      return {
        ...state,
        queue: [...state.queue, action.payload],
      };
    case 'NEXT_TRACK':
      const nextIndex = state.queue.findIndex(track => track.id === state.currentTrack?.id) + 1;
      const nextTrack = nextIndex < state.queue.length ? state.queue[nextIndex] : null;
      return {
        ...state,
        currentTrack: nextTrack,
        isPlaying: nextTrack ? true : false,
      };
    case 'PREVIOUS_TRACK':
      const prevIndex = state.queue.findIndex(track => track.id === state.currentTrack?.id) - 1;
      const prevTrack = prevIndex >= 0 ? state.queue[prevIndex] : null;
      return {
        ...state,
        currentTrack: prevTrack,
        isPlaying: prevTrack ? true : false,
      };
    case 'SET_PLAYLIST':
      return {
        ...state,
        currentPlaylist: action.payload,
        queue: action.payload.tracks.map(item => item.music),
      };
    default:
      return state;
  }
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(musicReducer, initialState);

  const playTrack = (track: Track) => {
    dispatch({ type: 'PLAY_TRACK', payload: track });
  };

  const pause = () => {
    dispatch({ type: 'PAUSE' });
  };

  const resume = () => {
    dispatch({ type: 'RESUME' });
  };

  const stop = () => {
    dispatch({ type: 'STOP' });
  };

  const setVolume = (volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  };

  const setTime = (time: number) => {
    dispatch({ type: 'SET_TIME', payload: time });
  };

  const nextTrack = () => {
    dispatch({ type: 'NEXT_TRACK' });
  };

  const previousTrack = () => {
    dispatch({ type: 'PREVIOUS_TRACK' });
  };

  const addToQueue = (track: Track) => {
    dispatch({ type: 'ADD_TO_QUEUE', payload: track });
  };

  const setQueue = (tracks: Track[]) => {
    dispatch({ type: 'SET_QUEUE', payload: tracks });
  };

  const setPlaylist = (playlist: Playlist) => {
    dispatch({ type: 'SET_PLAYLIST', payload: playlist });
  };

  const value: MusicContextType = {
    ...state,
    playTrack,
    pause,
    resume,
    stop,
    setVolume,
    setTime,
    nextTrack,
    previousTrack,
    addToQueue,
    setQueue,
    setPlaylist,
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
