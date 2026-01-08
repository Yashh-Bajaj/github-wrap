import './ErrorState.css';
import { getFunnyErrorQuote, getPrivateReposMessage } from '../utils/quotes';

interface ErrorStateProps {
  error: string;
  onReset: () => void;
}

export default function ErrorState({ error, onReset }: ErrorStateProps) {
  const isPrivateRepoError = error.toLowerCase().includes('private');
  const funnyQuote = isPrivateRepoError ? getPrivateReposMessage() : getFunnyErrorQuote();

  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon">😭</div>
        <h2 className="error-title">Oops! Something went sideways!</h2>
        <p className="error-message">{funnyQuote}</p>
        
        {/* <div className="error-details">
          <p className="error-code">Error: {error}</p>
        </div> */}

        <button onClick={onReset} className="error-button">
          🔄 Try Again
        </button>
      </div>
    </div>
  );
}
