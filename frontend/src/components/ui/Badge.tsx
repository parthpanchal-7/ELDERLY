import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, Clock, AlertTriangle, XCircle, PauseCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export interface BadgeProps {
  status: 'taken' | 'due' | 'scheduled' | 'overdue' | 'unconfirmed' | 'missed' | 'skipped' | 'active' | 'paused' | 'discontinued';
  label?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label, className }) => {
  let t = (key: any) => key;
  try {
    const theme = useTheme();
    t = theme.t;
  } catch {
    // Graceful fallback if rendered outside ThemeProvider
  }

  const configs = {
    taken: {
      bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-700" />,
      text: label || t('statusTaken'),
    },
    due: {
      bg: 'bg-teal/15 text-teal border-teal/40',
      icon: <Clock className="w-4 h-4 mr-1 text-teal" />,
      text: label || t('statusDue'),
    },
    scheduled: {
      bg: 'bg-stone-100 text-stone-800 border-stone-300',
      icon: <Clock className="w-4 h-4 mr-1 text-stone-600" />,
      text: label || t('statusScheduled'),
    },
    overdue: {
      bg: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: <AlertTriangle className="w-4 h-4 mr-1 text-amber-700" />,
      text: label || t('statusUnconfirmed'),
    },
    unconfirmed: {
      bg: 'bg-orange-100 text-orange-900 border-orange-300',
      icon: <AlertTriangle className="w-4 h-4 mr-1 text-orange-700" />,
      text: label || t('statusUnconfirmed'),
    },
    missed: {
      bg: 'bg-rose-100 text-rose-900 border-rose-300',
      icon: <XCircle className="w-4 h-4 mr-1 text-rose-700" />,
      text: label || t('statusMissed'),
    },
    skipped: {
      bg: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: <PauseCircle className="w-4 h-4 mr-1 text-slate-600" />,
      text: label || t('statusSkipped'),
    },
    active: {
      bg: 'bg-teal/10 text-teal border-teal/30',
      icon: <CheckCircle2 className="w-4 h-4 mr-1 text-teal" />,
      text: label || 'Active',
    },
    paused: {
      bg: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: <PauseCircle className="w-4 h-4 mr-1 text-amber-700" />,
      text: label || 'Paused',
    },
    discontinued: {
      bg: 'bg-stone-200 text-stone-700 border-stone-400',
      icon: <XCircle className="w-4 h-4 mr-1 text-stone-500" />,
      text: label || 'Discontinued',
    },
  };

  const c = configs[status] || configs.scheduled;

  return (
    <span
      className={clsx(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border',
        c.bg,
        className
      )}
    >
      {c.icon}
      <span>{c.text}</span>
    </span>
  );
};
