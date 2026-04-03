import React from 'react';
import { User, Calendar, Building2, CircleDollarSign } from 'lucide-react';

const EntityCard = ({ title, entities, type }) => {
  if (!entities || entities.length === 0) return null;

  const icons = {
    names: <User className="w-4 h-4 text-blue-400" />,
    dates: <Calendar className="w-4 h-4 text-emerald-400" />,
    organizations: <Building2 className="w-4 h-4 text-purple-400" />,
    amounts: <CircleDollarSign className="w-4 h-4 text-amber-400" />,
  };

  return (
    <div className="p-4 rounded-xl glass-morphism space-y-3">
      <div className="flex items-center gap-2">
        {icons[type]}
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {entities.map((entity, idx) => (
          <span 
            key={idx} 
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
          >
            {entity}
          </span>
        ))}
      </div>
    </div>
  );
};

export default EntityCard;
