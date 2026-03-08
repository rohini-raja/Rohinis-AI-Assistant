import { Card } from "@/components/ui/card";
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, Search, Loader2, Shuffle, Repeat, VolumeX, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect, useCallback } from "react";

type TrackCategory = "all" | "openings" | "lofi" | "ambient";

interface Track {
  title: string;
  url: string;
  artist: string;
  category: "openings" | "lofi" | "ambient";
}

const PLAYLIST: Track[] = [
  { title: "Hero's Come Back!!", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", artist: "nobodyknows+", category: "openings" },
  { title: "Blue Bird", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", artist: "Ikimono-gakari", category: "openings" },
  { title: "Silhouette", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", artist: "KANA-BOON", category: "openings" },
  { title: "Sign", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", artist: "FLOW", category: "openings" },
  { title: "Go!!!", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", artist: "FLOW", category: "openings" },
  { title: "Haruka Kanata", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", artist: "ASIAN KUNG-FU GENERATION", category: "openings" },
  { title: "Rocks", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", artist: "Hound Dog", category: "openings" },
  { title: "Closer", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", artist: "Joe Inoue", category: "openings" },
  { title: "Hotaru no Hikari", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", artist: "Ikimono-gakari", category: "openings" },
  { title: "Toubi", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", artist: "7!! Seven Oops", category: "openings" },
  { title: "Distance", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", artist: "LONG SHOT PARTY", category: "openings" },
  { title: "Diver", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", artist: "NICO Touches the Walls", category: "openings" },
  { title: "Guren (Lofi)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3", artist: "Shinobi Beats", category: "lofi" },
  { title: "Samidare (Lofi)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3", artist: "Hidden Leaf", category: "lofi" },
  { title: "Loneliness (Lofi)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3", artist: "Ninja Vibes", category: "lofi" },
  { title: "Decision (Lofi)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3", artist: "Shinobi Chill", category: "lofi" },
  { title: "Man of the World (Lofi)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3", artist: "Leaf Village", category: "lofi" },
  { title: "Sadness & Sorrow (Lofi)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", artist: "Ninja Vibes", category: "lofi" },
  { title: "Afternoon of Konoha (Lofi)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", artist: "Leaf Village", category: "lofi" },
  { title: "Gentle Hands (Lofi)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", artist: "Shinobi Beats", category: "lofi" },
  { title: "Hidden Leaf Forest", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", artist: "Nature Sounds", category: "ambient" },
  { title: "Rainy Amegakure", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", artist: "Nature Sounds", category: "ambient" },
  { title: "Wind Country Breeze", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", artist: "Nature Sounds", category: "ambient" },
  { title: "Waterfall of Truth", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", artist: "Nature Sounds", category: "ambient" },
  { title: "Mount Myoboku Night", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", artist: "Nature Sounds", category: "ambient" },
  { title: "Ocean of Land of Waves", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", artist: "Nature Sounds", category: "ambient" },
];

const CATEGORY_LABELS: Record<TrackCategory, string> = {
  all: "All",
  openings: "Openings",
  lofi: "Lofi",
  ambient: "Ambient",
};

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function NinjaMelodies() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem("ninja-volume") || "0.7"));
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "all" | "one">("off");
  const [category, setCategory] = useState<TrackCategory>("all");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const currentTrack = PLAYLIST[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    localStorage.setItem("ninja-volume", volume.toString());
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const getNextIndex = useCallback(() => {
    if (shuffle) {
      let next = Math.floor(Math.random() * PLAYLIST.length);
      while (next === currentTrackIndex && PLAYLIST.length > 1) {
        next = Math.floor(Math.random() * PLAYLIST.length);
      }
      return next;
    }
    return (currentTrackIndex + 1) % PLAYLIST.length;
  }, [shuffle, currentTrackIndex]);

  const handleTrackEnd = useCallback(() => {
    if (repeat === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else if (repeat === "all" || currentTrackIndex < PLAYLIST.length - 1 || shuffle) {
      setCurrentTrackIndex(getNextIndex());
    } else {
      setIsPlaying(false);
    }
  }, [repeat, currentTrackIndex, shuffle, getNextIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => setCurrentTrackIndex(getNextIndex());

  const prevTrack = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
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

  const filteredPlaylist = PLAYLIST.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || t.category === category;
    return matchesSearch && matchesCategory;
  });

  const selectTrack = (track: Track) => {
    const originalIndex = PLAYLIST.findIndex(t => t.url === track.url && t.title === track.title);
    setCurrentTrackIndex(originalIndex);
    setIsPlaying(true);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="p-4 bg-neutral-900 border-primary/30 shadow-lg">
      <h3 className="text-lg font-display text-primary flex items-center gap-2 mb-3">
        <Music className="h-5 w-5" />
        NINJA MELODIES
      </h3>

      <div className="flex gap-1 mb-3">
        {(Object.keys(CATEGORY_LABELS) as TrackCategory[]).map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={category === cat ? "default" : "outline"}
            onClick={() => setCategory(cat)}
            className="text-[9px] h-6 px-2 flex-1"
            data-testid={`music-category-${cat}`}
          >
            {CATEGORY_LABELS[cat]}
          </Button>
        ))}
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-500" />
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tracks..."
          className="h-7 pl-7 bg-neutral-950 border-neutral-800 text-[10px] focus:border-primary"
          data-testid="music-search"
        />
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <audio 
          ref={audioRef} 
          src={currentTrack.url}
          onEnded={handleTrackEnd}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
        
        <div className="w-full h-20 bg-neutral-950 rounded border border-neutral-800 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          {isPlaying && (
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[2px] h-8 px-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary/40 rounded-t animate-pulse"
                  style={{
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                  }}
                />
              ))}
            </div>
          )}
          <div className="text-center z-10 px-3">
            <p className="text-[10px] text-primary font-bold truncate uppercase">
              {isPlaying ? 'CHAKRA FLOWING...' : 'RESTING...'}
            </p>
            <p className="text-[11px] text-white mt-1 uppercase font-bold truncate" data-testid="music-current-title">
              {currentTrack.title}
            </p>
            <p className="text-[9px] text-neutral-500 uppercase truncate" data-testid="music-current-artist">
              {currentTrack.artist}
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
              {filteredPlaylist.length} tracks
            </span>
          </div>
          <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-0.5">
            {filteredPlaylist.map((track) => (
              <button
                key={`${track.title}-${track.artist}`}
                onClick={() => selectTrack(track)}
                className={`w-full text-left px-2 py-1.5 rounded text-[9px] transition-colors flex items-center justify-between group ${currentTrack.url === track.url && currentTrack.title === track.title ? 'bg-primary/20 text-primary' : 'hover:bg-neutral-800 text-neutral-400'}`}
                data-testid={`music-track-${track.title.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <div className="truncate pr-2 flex-1">
                  <p className="font-bold truncate">{track.title}</p>
                  <p className="opacity-60 truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[7px] px-1 py-0.5 rounded bg-neutral-800 text-neutral-500 uppercase">{track.category}</span>
                  {currentTrack.url === track.url && currentTrack.title === track.title && isPlaying && <Loader2 className="h-3 w-3 animate-spin" />}
                </div>
              </button>
            ))}
            {filteredPlaylist.length === 0 && (
              <p className="text-[9px] text-neutral-600 text-center py-4">No tracks found</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
