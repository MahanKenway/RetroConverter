import React, { useEffect, useState } from 'react';

const TaskbarComponent = ({ windows, activeWindowId, onTaskbarClick }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-slate-300 border-t-2 border-slate-500 flex items-center px-2 gap-2 z-[999]">
      <button type="button" className="px-3 h-7 border border-slate-600 bg-slate-100 font-semibold text-sm">Start</button>
      <div className="flex-1 flex gap-1 overflow-auto">
        {windows?.map((win) => (
          <button
            type="button"
            key={win.id}
            className={`px-3 h-7 border text-sm whitespace-nowrap ${activeWindowId === win.id ? 'bg-slate-100 border-slate-700' : 'bg-slate-200 border-slate-500'}`}
            onClick={() => onTaskbarClick?.(win.id)}
          >
            {win.title}
          </button>
        ))}
      </div>
      <div className="px-2 h-7 border border-slate-600 bg-slate-100 text-xs grid place-items-center min-w-20">
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default TaskbarComponent;
