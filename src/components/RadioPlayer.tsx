import React, { useState, useRef, useEffect } from 'react';

const RadioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(50);
  const [liveStreams, setLiveStreams] = useState<any[]>([]);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const fetchLiveStreams = async () => {
      try {
        const backendUrl = `${import.meta.env.VITE_API_URL}/api/get-live-streams`;
        const response = await fetch(backendUrl);

        if (!response.ok) {
          throw new Error('Failed to fetch live streams.');
        }

        const data = await response.json();
        setLiveStreams(data.streamDetails);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching live streams:', error);
        setIsLoading(false);
      }
    };

    fetchLiveStreams();
  }, []);

  useEffect(() => {
    if (!isLoading && liveStreams.length > 0) {
      const script = document.createElement('script');
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);

      (window as any).onYouTubeIframeAPIReady = () => {
        playerRef.current = new (window as any).YT.Player('radio-iframe', {
          videoId: liveStreams[currentStreamIndex].id,
          playerVars: {
            'autoplay': 1,
            'controls': 0,
            'loop': 1,
            'enablejsapi': 1,
            'modestbranding': 1,
            'playlist': liveStreams.map(s => s.id).join(',')
          },
          events: {
            'onReady': (event: any) => {
              event.target.setVolume(volume);
            }
          }
        });
      };
    }
  }, [isLoading, liveStreams]);

  useEffect(() => {
    if (playerRef.current) {
      isPlaying ? playerRef.current.playVideo() : playerRef.current.pauseVideo();
      playerRef.current.setVolume(volume);
    }
  }, [isPlaying, volume]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const handleNextStream = () => {
    const nextIndex = (currentStreamIndex + 1) % liveStreams.length;
    setCurrentStreamIndex(nextIndex);
    if (playerRef.current) {
      playerRef.current.loadVideoById(liveStreams[nextIndex].id);
    }
  };

  const handlePrevStream = () => {
    const prevIndex = (currentStreamIndex - 1 + liveStreams.length) % liveStreams.length;
    setCurrentStreamIndex(prevIndex);
    if (playerRef.current) {
      playerRef.current.loadVideoById(liveStreams[prevIndex].id);
    }
  };

  if (isLoading) {
    return (
      <div style={{ position: 'fixed', bottom: '1rem', left: '1rem', zIndex: '50' }}>
        <div style={{ backgroundColor: 'transparent', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', width: '250px' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#06b6d4', marginBottom: '0.5rem', textAlign: 'center' }}>Carregando Rádio...</h3>
        </div>
      </div>
    );
  }

  const currentStream = liveStreams[currentStreamIndex];

  return (
    <div style={{ position: 'fixed', bottom: '1rem', left: '1rem', zIndex: '50' }}>
      <div style={{ backgroundColor: 'transparent', padding: '0.5rem', borderRadius: '0.5rem', width: '200px' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#84019eff', textAlign: 'center' }}>Lo-Fi Radio</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <button onClick={handlePrevStream} style={{ color: 'white', fontSize: '0.7rem', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
            &lt;&lt;
          </button>
          <button onClick={handlePlayPause} style={{ color: 'white', fontSize: '1rem', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
            {isPlaying ? '⏸' : '▶️'}
          </button>
          <button onClick={handleNextStream} style={{ color: 'white', fontSize: '0.7rem', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
            &gt;&gt;
          </button>
        </div>
        <h4 style={{ fontSize: '0.65rem', color: 'gray', textAlign: 'center', marginTop: '0.25rem' }}>
          {currentStream?.title || 'Sem título'}
        </h4>
        <input 
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          style={{ width: '100%', marginTop: '0.5rem' }}
        />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.25rem' }}>
          {/* O iframe do player do YouTube. Ele será controlado pela API. */}
          <div id="radio-iframe" style={{ width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}></div>
        </div>
      </div>
    </div>
  );
};

export default RadioPlayer;

