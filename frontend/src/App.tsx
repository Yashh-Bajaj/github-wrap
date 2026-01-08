import { useState } from 'react';
import './App.css';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorState from './components/ErrorState';
import type { WrappedData } from './types';
import { transformBackendData } from './utils/transform';

function App() {
  const [wrappedData, setWrappedData] = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (username: string, year: number) => {
    setLoading(true);
    setError(null);
    setWrappedData(null);
    setSearched(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log(`Fetching from API URL: ${apiUrl}`);
      const response = await fetch(
        `${apiUrl}/api/wrapped?username=${username}&year=${year}`
      );
      console.log('Fetch response:', response);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `User not found (${response.status})`);
      }

      const data = await response.json();
      if (data.data) {
        const transformedData = transformBackendData(data.data);
        setWrappedData(transformedData);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong!';
      setError(errorMessage);
      console.error('Error fetching wrapped data:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="background-elements">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <main className="container">
        {!wrappedData && (
          <>
            <div className="header">
              <h1 className="title">
                <span className="title-char">G</span>
                <span className="title-char">I</span>
                <span className="title-char">T</span>
                <span className="title-char">H</span>
                <span className="title-char">U</span>
                <span className="title-char">B</span>
                <span className="title-space"></span>
                <span className="title-char">W</span>
                <span className="title-char">R</span>
                <span className="title-char">A</span>
                <span className="title-char">P</span>
                <span className="title-char">P</span>
                <span className="title-char">E</span>
                <span className="title-char">D</span>
              </h1>
              <p className="subtitle">
                ✨ Your GitHub story for {new Date().getFullYear()} ✨
              </p>
            </div>

            {!searched && !error && <InputForm onSearch={handleSearch} />}

            {loading && <LoadingSpinner />}

            {error && (
              <ErrorState
                error={error}
                onReset={() => {
                  setError(null);
                  setSearched(false);
                }}
              />
            )}
          </>
        )}

        {wrappedData && (
          <ResultsDisplay
            data={wrappedData}
            onReset={() => {
              setWrappedData(null);
              setSearched(false);
              setError(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
