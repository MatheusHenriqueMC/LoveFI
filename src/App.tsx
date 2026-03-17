import { useState } from 'react';
import './index.css';
import MoodMusicPlayer from './components/MoodMusicPlayer';
import RadioPlayer from './components/RadioPlayer';

function App() {
  const [moodText, setMoodText] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMusic = async () => {
    setLoading(true);
    setError(null);
    setVideos([]);
    try {
      const backendPort = import.meta.env.VITE_BACKEND_PORT || '3001';
      const backendUrl = `${import.meta.env.VITE_API_URL}/api/get-music-by-mood`;
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ moodText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro desconhecido ao buscar músicas.');
      }

      const data = await response.json();
      setVideos(data.videos);
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar músicas:', err);
    } finally {
      setLoading(false);
    }
  };

  const surpriseMe = async () => {
    setLoading(true);
    setError(null);
    setVideos([]);
    try {
      const backendPort = import.meta.env.VITE_BACKEND_PORT || '3001';
      const backendUrl = `${import.meta.env.VITE_API_URL}/api/surprise-me`;
      
      const response = await fetch(backendUrl);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro desconhecido ao buscar músicas.');
      }

      const data = await response.json();
      setVideos(data.videos);
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar músicas:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1 style={{ fontSize: '3rem', color: '#84019eff', marginBottom: '0.5rem' }}>Love-Fi</h1>
        <p style={{ fontSize: '1rem', color: '#a0aec0' }}>Descreva seu mood e encontre a trilha sonora perfeita!</p>
      </header>

      <main className="input-card">
        <div className="input-section">
          <textarea
            className="input-field"
            rows={4}
            placeholder="Escreva aqui como está se sentindo <3"
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
          ></textarea>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="submit-button"
              onClick={fetchMusic}
              disabled={loading || moodText.trim() === ''}
            >
              {loading ? 'Buscando...' : 'Encontrar Minha Vibe'}
            </button>
            <button
              className="submit-button"
              onClick={surpriseMe}
              disabled={loading}
              style={{ backgroundColor: '#510664ff', color: '#ffffff' }}
            >
              Me Surpreenda
            </button>
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
      </main>
        
      {videos.length > 0 && <MoodMusicPlayer videos={videos} />}
      
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem' }}>
        <RadioPlayer />
      </div>
    </div>
  );
}

export default App;


