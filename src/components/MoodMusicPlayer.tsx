import React, { useState } from 'react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
}

interface MoodMusicPlayerProps {
  videos: Video[];
}

const MoodMusicPlayer: React.FC<MoodMusicPlayerProps> = ({ videos }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  if (!videos || videos.length === 0) {
    return null;
  }

  const handleNextVideo = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  const handlePrevVideo = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex - 1 + videos.length) % videos.length);
  };

  const currentVideo = videos[currentVideoIndex];

  return (
    <div className="music-results">
      <h2 style={{ fontSize: '2rem', color: '#06b6d4', marginBottom: '1rem', marginTop: '2rem' }}></h2>
      <div className="video-carousel flex items-center justify-center gap-4">
        <button className="nav-button" onClick={handlePrevVideo}>
          <img src="/pixel-arrow.png" alt="Anterior" style={{ transform: 'scaleX(-1)', height: '60px' }} />
        </button>
        <div className="video-item flex-1">
          <iframe
            width="100%"
            height="360"
            src={`https://www.youtube.com/embed/${currentVideo.id}`}
            title={currentVideo.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          <h3 style={{ color: 'white', padding: '1rem', fontSize: '1.2rem' }}>{currentVideo.title}</h3>
        </div>
        <button className="nav-button" onClick={handleNextVideo}>
          <img src="/pixel-arrow.png" alt="Próximo" style={{ height: '60px' }} />
        </button>
      </div>
    </div>
  );
};

export default MoodMusicPlayer;
