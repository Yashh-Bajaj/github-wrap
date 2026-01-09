import './ResultsDisplay.css';
import type { WrappedData } from '../types';
import { getQuoteForCommits } from '../utils/quotes';
import Confetti from './Confetti';
import { useEffect, useState } from 'react';

interface ResultsDisplayProps {
  data: WrappedData;
  onReset: () => void;
}

export default function ResultsDisplay({ data, onReset }: ResultsDisplayProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const quote = getQuoteForCommits(data.totalCommits);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate insights every 5 seconds
  useEffect(() => {
    if (data.insights.length === 0) return;
    const interval = setInterval(() => {
      setCurrentInsightIndex((prev) => (prev + 1) % data.insights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [data.insights.length]);

  const nextInsight = () => {
    setCurrentInsightIndex((prev) => (prev + 1) % data.insights.length);
  };

  const prevInsight = () => {
    setCurrentInsightIndex((prev) => (prev - 1 + data.insights.length) % data.insights.length);
  };

  const goToInsight = (index: number) => {
    setCurrentInsightIndex(index);
  };

  const handleShare = () => {
    const text = `🎉 My GitHub Wrapped for ${data.year}!\n\n📊 ${data.totalCommits} commits\n🔧 ${data.totalRepositories} repos\n⭐ ${data.totalStars} stars\n\n${quote}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'GitHub Wrapped',
        text: text,
      });
    } else {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="results-wrapper">
      {showConfetti && <Confetti />}
      
      <button className="reset-button" onClick={onReset} title="Start over">
        ↩️
      </button>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-username">{data.username}</h1>
          <p className="hero-year">GitHub Wrapped {data.year}</p>
          <div className="hero-stats">
            <div className="stat-box">
              <span className="stat-number">{data.totalCommits}</span>
              <span className="stat-label">Commits</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{data.totalRepositories}</span>
              <span className="stat-label">Repos</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">⭐{data.totalStars}</span>
              <span className="stat-label">Stars</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="results-grid">
        {/* Top Languages */}
        <section className="insight-card languages-card">
          <h2 className="card-title">🎨 Top Languages</h2>
          <div className="languages-list">
            {data.topLanguages.slice(0, 5).map((lang, idx) => (
              <div key={idx} className="language-item">
                <span className="lang-name">{lang.name}</span>
                <div className="lang-bar">
                  <div
                    className="lang-fill"
                    style={{
                      width: `${data.topLanguages.length > 0 ? (lang.count / Math.max(...data.topLanguages.map(l => l.count))) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="lang-count">{lang.count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Contribution Stats */}
        <section className="insight-card stats-card">
          <h2 className="card-title">📈 Contribution Stats</h2>
          <div className="stats-content">
            <div className="stat-item">
              <span className="stat-icon">🔀</span>
              <div className="stat-text">
                <p className="stat-number-large">{data.totalPullRequests}</p>
                <p className="stat-label-small">Pull Requests</p>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎯</span>
              <div className="stat-text">
                <p className="stat-number-large">{data.totalIssues}</p>
                <p className="stat-label-small">Issues</p>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🔥</span>
              <div className="stat-text">
                <p className="stat-number-large">{data.contributionStreak}</p>
                <p className="stat-label-small">Day Streak</p>
              </div>
            </div>
          </div>
        </section>

        {/* Top Repositories */}
        <section className="insight-card repos-card">
          <h2 className="card-title">🏆 Top Repositories</h2>
          <div className="repos-list">
            {data.topRepositories.slice(0, 3).map((repo, idx) => (
              <div key={idx} className="repo-item">
                <div className="repo-header">
                  <span className="repo-name">{repo.name}</span>
                  <span className="repo-stars">⭐ {repo.stars}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Monthly Breakdown */}
        <section className="insight-card calendar-card">
          <h2 className="card-title">📅 Monthly Activity</h2>
          <div className="months-grid">
            {data.monthlyBreakdown.map((month, idx) => (
                
              <div key={idx} className="month-box">
                <span className="month-short">{month.month}</span>
                <div className="month-bar">
                  <div
                    className="month-fill"
                    style={{
                      height: `${Math.min((month.contributions / 100) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <span className="month-count">{month.contributions}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Insights Carousel */}
        {data.insights && data.insights.length > 0 && (
          <section className="insight-card insights-card">
            <h2 className="card-title">💡 Key Insights</h2>
            <div className="insights-carousel">
              <button 
                className="carousel-nav carousel-prev" 
                onClick={prevInsight}
                aria-label="Previous insight"
              >
                ← 
              </button>
              
              <div className="carousel-container">
                <div className="carousel-track" style={{
                  transform: `translateX(calc(-${currentInsightIndex * 100}%))`
                }}>
                  {data.insights.map((insight, idx) => (
                    <div 
                      key={idx}
                      className={`carousel-slide insight-badge insight-badge-${insight.category}`}
                    >
                      <div className="insight-emoji">{insight.emoji}</div>
                      <div className="insight-text">{insight.text}</div>
                      <div className={`insight-accent insight-accent-${insight.category}`}></div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                className="carousel-nav carousel-next" 
                onClick={nextInsight}
                aria-label="Next insight"
              >
                →
              </button>
            </div>

            {/* Carousel Indicators */}
            <div className="carousel-indicators">
              {data.insights.map((_, idx) => (
                <button
                  key={idx}
                  className={`indicator-dot ${idx === currentInsightIndex ? 'active' : ''}`}
                  onClick={() => goToInsight(idx)}
                  aria-label={`Go to insight ${idx + 1}`}
                />
              ))}
              <span className="indicator-counter">
                {currentInsightIndex + 1} / {data.insights.length}
              </span>
            </div>
          </section>
        )}
      </div>

      {/* Quote Section */}
      <section className="quote-section">
        <div className="quote-card">
          <p className="quote-text">"{quote}"</p>
          <p className="quote-attribution">— Your GitHub Era ✨</p>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="share-button" onClick={handleShare}>
          🚀 Share Your Wrap
        </button>
        <button className="new-search-button" onClick={onReset}>
          🔍 Search Another User
        </button>
      </div>
    </div>
  );
}
