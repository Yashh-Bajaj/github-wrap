import './LoadingSpinner.css';

export default function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <p className="loading-text">🔮 Summoning your GitHub universe...</p>
      <p className="loading-subtext">Buckle up! This is gonna be spicy! 🌶️</p>
    </div>
  );
}
