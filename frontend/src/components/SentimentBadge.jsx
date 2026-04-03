import React from 'react';
import { Smile, Meh, Frown } from 'lucide-react';

const SentimentBadge = ({ sentiment }) => {
  const { label } = sentiment;

  const configs = {
    Positive: {
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: <Smile className="w-4 h-4 mr-1.5" />,
    },
    Neutral: {
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: <Meh className="w-4 h-4 mr-1.5" />,
    },
    Negative: {
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: <Frown className="w-4 h-4 mr-1.5" />,
    }
  };

  const config = configs[label] || configs.Neutral;

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${config.color}`}>
      {config.icon}
      {label}
    </div>
  );
};

export default SentimentBadge;
