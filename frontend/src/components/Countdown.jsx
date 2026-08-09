import { useState, useEffect } from 'react';

const getBreakdown = (targetDate) => {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { diff, days, hours, minutes, seconds };
};

// Live-ticking countdown to a target date. Used for "next up" event reminders.
const Countdown = ({ targetDate, compact = false }) => {
  const [time, setTime] = useState(() => getBreakdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => setTime(getBreakdown(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (time.diff <= 0) {
    return <span className="text-teal font-semibold text-sm">Happening now</span>;
  }

  if (compact) {
    return (
      <span className="text-sm font-semibold text-ink">
        {time.days > 0 ? `${time.days}d ${time.hours}h` : `${time.hours}h ${time.minutes}m`}
      </span>
    );
  }

  return (
    <div className="flex gap-3">
      {[
        { label: 'Days', value: time.days },
        { label: 'Hrs', value: time.hours },
        { label: 'Min', value: time.minutes },
        { label: 'Sec', value: time.seconds },
      ].map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="w-12 h-12 rounded-lg bg-ink text-paper font-display text-lg font-semibold flex items-center justify-center">
            {String(unit.value).padStart(2, '0')}
          </div>
          <p className="text-[10px] uppercase tracking-wide text-ink/40 font-semibold mt-1">{unit.label}</p>
        </div>
      ))}
    </div>
  );
};

export default Countdown;
