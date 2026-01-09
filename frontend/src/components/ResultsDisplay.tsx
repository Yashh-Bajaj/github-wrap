import './ResultsDisplay.css';
import type { WrappedData } from '../types';
import { getQuoteForData } from '../utils/quotes';
import Confetti from './Confetti';
import { useEffect, useState } from 'react';

interface ResultsDisplayProps {
  data: WrappedData;
  onReset: () => void;
}

export default function ResultsDisplay({ data, onReset }: ResultsDisplayProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const quote = getQuoteForData(data);

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
          
          {/* Profile Info */}
          {data.profile && (
            <div className="hero-profile">
              {data.profile.bio && (
                <p className="hero-bio">"{data.profile.bio}"</p>
              )}
              <div className="hero-profile-stats">
                {data.profile.accountAge !== null && (
                  <span className="profile-stat">👤 {data.profile.accountAge} years on GitHub</span>
                )}
                <span className="profile-stat">👥 {data.profile.followers} followers</span>
                {data.profile.location && (
                  <span className="profile-stat">📍 {data.profile.location}</span>
                )}
              </div>
            </div>
          )}

          <div className="hero-stats">
            <div className="stat-box">
              <span className="stat-number">{data.totalContributions || data.totalCommits}</span>
              <span className="stat-label">Contributions</span>
              {data.totalContributions && data.totalContributions !== data.totalCommits && (
                <span className="stat-sublabel">({data.totalCommits} commits)</span>
              )}
            </div>
            <div className="stat-box">
              <span className="stat-number">{data.totalRepositories}</span>
              <span className="stat-label">Repos</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">⭐{data.totalStars}</span>
              <span className="stat-label">Stars</span>
            </div>
            {data.longestStreak > 0 && (
              <div className="stat-box highlight-stat">
                <span className="stat-number">🔥{data.longestStreak}</span>
                <span className="stat-label">Day Streak</span>
              </div>
            )}
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
                <p className="stat-number-large">{data.longestStreak || data.contributionStreak}</p>
                <p className="stat-label-small">Day Streak</p>
              </div>
            </div>
            {data.bestDayOfWeek && (
              <div className="stat-item">
                <span className="stat-icon">⚡</span>
                <div className="stat-text">
                  <p className="stat-number-large">{data.bestDayOfWeek.slice(0, 3)}</p>
                  <p className="stat-label-small">Power Day</p>
                </div>
              </div>
            )}
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
            {data.mostActiveRepo && (
              <div className="repo-item highlight-repo">
                <div className="repo-header">
                  <span className="repo-name">🔥 {data.mostActiveRepo.name}</span>
                  <span className="repo-stars">Most Active</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Top Topics */}
        {data.topTopics && data.topTopics.length > 0 && (
          <section className="insight-card topics-card">
            <h2 className="card-title">🏷️ Favorite Topics</h2>
            <div className="topics-list">
              {data.topTopics.slice(0, 5).map((topic, idx) => (
                <div key={idx} className="topic-badge">
                  <span className="topic-name">{topic.topic}</span>
                  <span className="topic-count">{topic.count}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Fork Stats */}
        {data.forkStats && data.forkStats.totalForks > 0 && (
          <section className="insight-card forks-card">
            <h2 className="card-title">🍴 Fork Stats</h2>
            <div className="forks-content">
              <div className="fork-stat">
                <span className="fork-number">{data.forkStats.totalForks}</span>
                <span className="fork-label">Total Forks</span>
              </div>
              {data.forkStats.mostForkedRepo && (
                <div className="fork-highlight">
                  <span className="fork-repo-name">"{data.forkStats.mostForkedRepo.name}"</span>
                  <span className="fork-repo-count">{data.forkStats.mostForkedRepo.forks} forks</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Repository Growth */}
        {data.repositoryGrowth && data.repositoryGrowth.reposCreatedInYear > 0 && (
          <section className="insight-card growth-card">
            <h2 className="card-title">🆕 New Repos This Year</h2>
            <div className="growth-content">
              <div className="growth-stat">
                <span className="growth-number">{data.repositoryGrowth.reposCreatedInYear}</span>
                <span className="growth-label">Repos Created</span>
              </div>
              {data.repositoryGrowth.mostStarredNewRepo && (
                <div className="growth-highlight">
                  <span className="growth-repo-name">"{data.repositoryGrowth.mostStarredNewRepo.name}"</span>
                  <span className="growth-repo-stars">⭐ {data.repositoryGrowth.mostStarredNewRepo.stars} stars</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Monthly Breakdown */}
        <section className="insight-card calendar-card">
          <h2 className="card-title">📅 Monthly Activity</h2>
          <div className="months-grid">
            {data.monthlyBreakdown.map((month, idx) => {
              const maxContributions = Math.max(...data.monthlyBreakdown.map(m => m.contributions));
              return (
                <div key={idx} className="month-box">
                  <span className="month-short">{month.month}</span>
                  <div className="month-bar">
                    <div
                      className="month-fill"
                      style={{
                        height: `${maxContributions > 0 ? (month.contributions / maxContributions) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="month-count">{month.contributions}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* License Distribution */}
        {/* {data.licenses && data.licenses.totalLicensed > 0 && (
          <section className="insight-card licenses-card">
            <h2 className="card-title">📜 License Distribution</h2>
            <div className="licenses-content">
              {data.licenses.topLicense && (
                <div className="license-highlight">
                  <span className="license-top">🏆 {data.licenses.topLicense}</span>
                  <span className="license-count">{data.licenses.licenseDistribution[data.licenses.topLicense]} repos</span>
                </div>
              )}
              <div className="licenses-list">
                {Object.entries(data.licenses.licenseDistribution)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([license, count], idx) => (
                    <div key={idx} className="license-item">
                      <span className="license-name">{license}</span>
                      <div className="license-bar">
                        <div
                          className="license-fill"
                          style={{
                            width: `${(count / data.licenses.totalLicensed) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="license-count">{count}</span>
                    </div>
                  ))}
              </div>
              {data.licenses.noLicenseCount > 0 && (
                <div className="license-note">
                  <span>⚠️ {data.licenses.noLicenseCount} repos without license</span>
                </div>
              )}
            </div>
          </section>
        )} */}

        {/* Streak & Best Day */}
        {(data.longestStreak > 0 || data.bestDayOfWeek) && (
          <section className="insight-card streak-card">
            <h2 className="card-title">🔥 Activity Highlights</h2>
            <div className="streak-content">
              {data.longestStreak > 0 && (
                <div className="streak-item">
                  <div className="streak-icon">🔥</div>
                  <div className="streak-details">
                    <span className="streak-label">Longest Streak</span>
                    <span className="streak-value">{data.longestStreak} days</span>
                    {data.longestStreak >= 30 && (
                      <span className="streak-badge">🔥 LEGENDARY</span>
                    )}
                  </div>
                </div>
              )}
              {data.bestDayOfWeek && (
                <div className="streak-item">
                  <div className="streak-icon">⚡</div>
                  <div className="streak-details">
                    <span className="streak-label">Best Day</span>
                    <span className="streak-value">{data.bestDayOfWeek}</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

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
        {/* <button className="share-button" onClick={handleShare}>
          🚀 Share Your Wrap
        </button> */}
        <button className="new-search-button" onClick={onReset}>
          🔍 Search Another User
        </button>
      </div>

      {/* Disclaimer */}
      <section className="disclaimer-section">
        <div className="disclaimer-card">
          <div className="disclaimer-icon">⚠️</div>
          <div className="disclaimer-content">
            <h3 className="disclaimer-title">Data Disclaimer</h3>
            <p className="disclaimer-text">
              This GitHub Wrapped is generated from public GitHub API data and may contain inaccuracies or approximations. 
              Some statistics are calculated from available data and might not reflect exact counts. 
              Data is provided "as is" for entertainment purposes. 
              <br />
              <span className="disclaimer-note">
                Note: Contribution counts include commits, pull requests, issues, and reviews. 
                Some metrics may vary due to API limitations or data availability.
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
