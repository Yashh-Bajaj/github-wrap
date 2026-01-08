import './Confetti.css';
import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
  emoji: string;
}

export default function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const emojis = ['🎉', '✨', '🚀', '⭐', '💫', '🔥', '💎', '🎊', '🌟', '👑'];
    const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 2 + Math.random() * 1,
      delay: Math.random() * 0.3,
      size: 20 + Math.random() * 30,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="confetti-container">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            '--duration': `${piece.duration}s`,
            '--delay': `${piece.delay}s`,
            fontSize: `${piece.size}px`,
          } as React.CSSProperties}
        >
          {piece.emoji}
        </div>
      ))}
    </div>
  );
}
