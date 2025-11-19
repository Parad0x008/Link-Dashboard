import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const Greeting: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="flex flex-col items-center justify-center mb-6 animate-fade-in">
      <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-2 bg-primary/10 px-3 py-1 rounded-full">
        <Clock size={14} />
        <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
        {getGreeting()}
      </h2>
    </div>
  );
};