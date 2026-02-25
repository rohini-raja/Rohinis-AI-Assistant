import { Card } from "@/components/ui/card";
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";

// Using a public collection of Naruto-themed Lofi / OST links (Direct URLs)
const DEFAULT_PLAYLIST = [
  { title: "Hero's Come Back!!", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", artist: "nobodyknows+" },
  { title: "Blue Bird", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", artist: "Ikimono-gakari" },
  { title: "Silhouette", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", artist: "KANA-BOON" },
  { title: "Sign", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", artist: "FLOW" },
  { title: "Go!!!", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", artist: "FLOW" },
  { title: "Haruka Kanata", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", artist: "ASIAN KUNG-FU GENERATION" },
  { title: "Rocks", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", artist: "Hound Dog" },
  { title: "Closer", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", artist: "Joe Inoue" },
  { title: "Hotaru no Hikari", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", artist: "Ikimono-gakari" },
  { title: "Toubi", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", artist: "7!! Seven Oops" },
];

export function NinjaMelodies() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [playlist] = useState(DEFAULT_PLAYLIST);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = DEFAULT_PLAYLIST[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % DEFAULT_PLAYLIST.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + DEFAULT_PLAYLIST.length) % DEFAULT_PLAYLIST.length);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const filteredPlaylist = DEFAULT_PLAYLIST.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectTrack = (index: number) => {
    const track = filteredPlaylist[index];
    const originalIndex = DEFAULT_PLAYLIST.findIndex(t => t.url === track.url);
    setCurrentTrackIndex(originalIndex);
    setIsPlaying(true);
  };

  return (
    <Card className="p-4 bg-neutral-900 border-primary/30 shadow-lg">
      <h3 className="text-lg font-display text-primary flex items-center gap-2 mb-4">
        <Music className="h-5 w-5" />
        NINJA MELODIES
      </h3>

      <form onSubmit={handleSearch} className="relative mb-4">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-500" />
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search chakra tunes..."
          className="h-7 pl-7 bg-neutral-950 border-neutral-800 text-[10px] focus:border-primary"
        />
      </form>
      
      <div className="flex flex-col items-center gap-4">
        <audio 
          ref={audioRef} 
          src={currentTrack.url} 
          onEnded={nextTrack}
        />
        
        <div className="w-full h-24 bg-neutral-950 rounded border border-neutral-800 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="text-center z-10 px-2">
            <p className="text-[10px] text-primary font-bold animate-pulse truncate uppercase">
              {isPlaying ? 'CHAKRA FLOWING...' : 'RESTING...'}
            </p>
            <p className="text-[10px] text-white mt-1 uppercase font-bold truncate">
              {currentTrack.title}
            </p>
            <p className="text-[9px] text-neutral-500 uppercase truncate">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button size="icon" variant="ghost" className="text-neutral-400 h-8 w-8" onClick={prevTrack}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            onClick={togglePlay}
            className="bg-primary text-primary-foreground h-10 w-10 rounded-full shadow-[0_0_15px_rgba(255,100,0,0.3)]"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button size="icon" variant="ghost" className="text-neutral-400 h-8 w-8" onClick={nextTrack}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-full flex items-center gap-2 px-2">
          <Volume2 className="h-3 w-3 text-neutral-500" />
          <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div className={`h-full bg-primary transition-all duration-300 ${isPlaying ? 'w-full' : 'w-0'}`} />
          </div>
        </div>

        {/* Search Results / Track List */}
        <div className="w-full mt-2 max-h-32 overflow-y-auto custom-scrollbar space-y-1">
          {filteredPlaylist.map((track, idx) => (
            <button
              key={track.title}
              onClick={() => selectTrack(idx)}
              className={`w-full text-left px-2 py-1.5 rounded text-[9px] transition-colors flex items-center justify-between group ${currentTrack.url === track.url ? 'bg-primary/20 text-primary' : 'hover:bg-neutral-800 text-neutral-400'}`}
            >
              <div className="truncate pr-2">
                <p className="font-bold truncate">{track.title}</p>
                <p className="opacity-60 truncate">{track.artist}</p>
              </div>
              {currentTrack.url === track.url && isPlaying && <Loader2 className="h-3 w-3 animate-spin shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
