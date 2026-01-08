import './InputForm.css';
import { useState } from 'react';

interface InputFormProps {
  onSearch: (username: string, year: number) => void;
}

export default function InputForm({ onSearch }: InputFormProps) {
  const [username, setUsername] = useState('');
  const [year, setYear] = useState(new Date().getFullYear()-1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsSubmitting(true);
      await onSearch(username.trim(), year);
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i-1);

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="username" className="form-label">
          🎸 GitHub Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. gvanrossum"
          className="form-input"
          disabled={isSubmitting}
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="year" className="form-label">
          📅 Which Year?
        </label>
        <select
          id="year"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="form-select"
          disabled={isSubmitting}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="form-button"
        disabled={!username.trim() || isSubmitting}
      >
        {isSubmitting ? '⏳ Loading...' : '🚀 Show Me My Wrap!'}
      </button>

      <p className="form-note">
        📌 <strong>Note:</strong> We only track public repositories. Private repo lovers, slide into my DMs! 🔐
      </p>
    </form>
  );
}
