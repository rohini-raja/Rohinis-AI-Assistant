import { Card } from "@/components/ui/card";
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, Search, Loader2, Shuffle, Repeat, VolumeX, ListMusic, Disc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect, useCallback } from "react";

type PlaylistTab = "openings" | "endings" | "ost" | "lofi";

interface DeezerTrack {
  id: number;
  title: string;
  artist: string;
  preview: string;
  album: string;
  cover: string;
  duration: number;
}

const TAB_LABELS: Record<PlaylistTab, string> = {
  openings: "Openings",
  endings: "Endings",
  ost: "OST",
  lofi: "Lofi",
};

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function NinjaMelodies() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<DeezerTrack | null>(null);
  const [playlist, setPlaylist] = useState<DeezerTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DeezerTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(true);
  const [activeTab, setActiveTab] = useState<PlaylistTab>("openings");
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem("ninja-volume") || "0.7"));
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "all" | "one">("off");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadPlaylist = useCallback(async (tab: PlaylistTab) => {
    setIsLoadingPlaylist(true);
    try {
      const res = await fetch(`/api/music/playlist/naruto_${tab}`);
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        setPlaylist(data.data);
        if (!currentTrack) {
          setCurrentTrack(data.data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load playlist:", err);
    }
    setIsLoadingPlaylist(false);
  }, [currentTrack]);

  useEffect(() => {
    loadPlaylist(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    localStorage.setItem("ninja-volume", volume.toString());
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.preview;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const searchMusic = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.data || []);
    } catch (err) {
      console.error("Search failed:", err);
    }
    setIsSearching(false);
  }, []);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchMusic(value), 400);
  };

  const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);

  const getNextIndex = useCallback(() => {
    if (shuffle) {
      let next = Math.floor(Math.random() * playlist.length);
      while (next === currentIndex && playlist.length > 1) {
        next = Math.floor(Math.random() * playlist.length);
      }
      return next;
    }
    return (currentIndex + 1) % playlist.length;
  }, [shuffle, currentIndex, playlist.length]);

  const handleTrackEnd = useCallback(() => {
    if (repeat === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else if (playlist.length > 0 && (repeat === "all" || currentIndex < playlist.length - 1 || shuffle)) {
      const nextIdx = getNextIndex();
      setCurrentTrack(playlist[nextIdx]);
    } else {
      setIsPlaying(false);
    }
  }, [repeat, currentIndex, shuffle, getNextIndex, playlist]);

  const togglePlay = () => {
    if (!currentTrack && playlist.length > 0) {
      setCurrentTrack(playlist[0]);
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    const nextIdx = getNextIndex();
    setCurrentTrack(playlist[nextIdx]);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (playlist.length === 0) return;
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else {
      const prevIdx = (currentIndex - 1 + playlist.length) % playlist.length;
      setCurrentTrack(playlist[prevIdx]);
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pos * duration;
  };

  const cycleRepeat = () => {
    setRepeat(prev => prev === "off" ? "all" : prev === "all" ? "one" : "off");
  };

  const selectTrack = (track: DeezerTrack) => {
    if (!playlist.find(t => t.id === track.id)) {
      setPlaylist(prev => [track, ...prev]);
    }
    setCurrentTrack(track);
    setIsPlaying(true);
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayList = showSearch && searchQuery ? searchResults : playlist;

  return (
    <Card className="p-4 bg-neutral-900 border-primary/30 shadow-lg">
      <h3 className="text-lg font-display text-primary flex items-center gap-2 mb-3">
        <Music className="h-5 w-5" />
        NINJA MELODIES
      </h3>

      <div className="flex gap-1 mb-3">
        {(Object.keys(TAB_LABELS) as PlaylistTab[]).map((tab) => (
          <Button
            key={tab}
            size="sm"
            variant={activeTab === tab && !showSearch ? "default" : "outline"}
            onClick={() => { setActiveTab(tab); setShowSearch(false); setSearchQuery(""); setSearchResults([]); }}
            className="text-[9px] h-6 px-2 flex-1"
            data-testid={`music-tab-${tab}`}
          >
            {TAB_LABELS[tab]}
          </Button>
        ))}
        <Button
          size="sm"
          variant={showSearch ? "default" : "outline"}
          onClick={() => setShowSearch(!showSearch)}
          className="text-[9px] h-6 px-2"
          data-testid="music-search-toggle"
        >
          <Search className="h-3 w-3" />
        </Button>
      </div>

      {showSearch && (
        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-500" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Search any song..."
            className="h-7 pl-7 bg-neutral-950 border-neutral-800 text-[10px] focus:border-primary"
            data-testid="music-search"
            autoFocus
          />
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <audio
          ref={audioRef}
          onEnded={handleTrackEnd}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />

        <div className="w-full h-20 bg-neutral-950 rounded border border-neutral-800 flex items-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          {currentTrack?.cover && (
            <div className="w-20 h-20 shrink-0 relative">
              <img src={currentTrack.cover} alt="" className="w-full h-full object-cover" />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Disc className="h-6 w-6 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                </div>
              )}
            </div>
          )}
          <div className="flex-1 min-w-0 px-3 z-10">
            <p className="text-[10px] text-primary font-bold truncate uppercase">
              {isPlaying ? 'CHAKRA FLOWING...' : 'RESTING...'}
            </p>
            <p className="text-[11px] text-white mt-0.5 font-bold truncate" data-testid="music-current-title">
              {currentTrack?.title || "Select a track"}
            </p>
            <p className="text-[9px] text-neutral-500 truncate" data-testid="music-current-artist">
              {currentTrack?.artist || ""}
            </p>
          </div>
        </div>

        <div className="w-full px-1">
          <div
            ref={progressRef}
            className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden cursor-pointer group"
            onClick={handleProgressClick}
            data-testid="music-progress"
          >
            <div
              className="h-full bg-primary rounded-full transition-[width] duration-200 group-hover:bg-primary/80"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-neutral-600 font-mono">{formatTime(currentTime)}</span>
            <span className="text-[8px] text-neutral-600 font-mono">{duration > 0 ? formatTime(duration) : '--:--'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full justify-center">
          <Button
            size="icon"
            variant="ghost"
            className={`h-7 w-7 ${shuffle ? 'text-primary' : 'text-neutral-500'}`}
            onClick={() => setShuffle(!shuffle)}
            data-testid="music-shuffle"
          >
            <Shuffle className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="text-neutral-400 h-8 w-8" onClick={prevTrack} data-testid="music-prev">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            onClick={togglePlay}
            className="bg-primary text-primary-foreground h-10 w-10 rounded-full shadow-[0_0_15px_rgba(255,100,0,0.3)]"
            data-testid="music-play"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button size="icon" variant="ghost" className="text-neutral-400 h-8 w-8" onClick={nextTrack} data-testid="music-next">
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={`h-7 w-7 ${repeat !== 'off' ? 'text-primary' : 'text-neutral-500'}`}
            onClick={cycleRepeat}
            data-testid="music-repeat"
          >
            <div className="relative">
              <Repeat className="h-3 w-3" />
              {repeat === "one" && <span className="absolute -top-1 -right-1 text-[6px] font-bold">1</span>}
            </div>
          </Button>
        </div>

        <div className="w-full flex items-center gap-2 px-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-neutral-500 hover:text-white shrink-0"
            onClick={() => setIsMuted(!isMuted)}
            data-testid="music-mute"
          >
            {isMuted || volume === 0 ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
          </Button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (v > 0) setIsMuted(false);
            }}
            className="flex-1 h-1 accent-primary cursor-pointer"
            data-testid="music-volume"
          />
        </div>

        <div className="w-full">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-neutral-500 flex items-center gap-1">
              <ListMusic className="h-3 w-3" />
              {showSearch && searchQuery ? `${searchResults.length} results` : `${playlist.length} tracks`}
            </span>
            {showSearch && searchQuery && isSearching && (
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
            )}
          </div>
          <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-0.5">
            {isLoadingPlaylist && !showSearch ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-[9px] text-neutral-500 ml-2">Loading tracks...</span>
              </div>
            ) : displayList.length > 0 ? (
              displayList.map((track) => (
                <button
                  key={track.id}
                  onClick={() => selectTrack(track)}
                  className={`w-full text-left px-2 py-1.5 rounded text-[9px] transition-colors flex items-center gap-2 group ${currentTrack?.id === track.id ? 'bg-primary/20 text-primary' : 'hover:bg-neutral-800 text-neutral-400'}`}
                  data-testid={`music-track-${track.id}`}
                >
                  {track.cover && (
                    <img src={track.cover} alt="" className="w-7 h-7 rounded shrink-0 object-cover" />
                  )}
                  <div className="truncate flex-1 min-w-0">
                    <p className="font-bold truncate">{track.title}</p>
                    <p className="opacity-60 truncate">{track.artist}</p>
                  </div>
                  {currentTrack?.id === track.id && isPlaying && <Loader2 className="h-3 w-3 animate-spin shrink-0" />}
                </button>
              ))
            ) : showSearch && searchQuery && !isSearching ? (
              <p className="text-[9px] text-neutral-600 text-center py-4">No results found</p>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
