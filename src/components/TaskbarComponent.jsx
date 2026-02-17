import React, { useEffect, useState, useRef } from 'react';

const TaskbarComponent = ({ windows, activeWindowId, onTaskbarClick }) => {
  const [now, setNow] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const startRef = useRef();

import React, { useEffect, useState } from 'react';

const TaskbarComponent = ({ windows, activeWindowId, onTaskbarClick }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (startRef.current && !startRef.current.contains(e.target)) {
        setShowStart(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <>
      {/* Start Menu */}
      {showStart && (
        <div className="start-menu">
          <div className="start-menu-sidebar">
            <span>RetroConverter</span>
          </div>
          <div className="start-menu-items">
            <div className="start-menu-item" onClick={() => { setShowStart(false); onTaskbarClick?.('converter-window'); }}>
              <span>🖼️</span> RetroConverter
            </div>
            <div className="start-menu-separator" />
            <div className="start-menu-item" onClick={() => window.location.reload()}>
              <span>🔄</span> Restart
            </div>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div className="taskbar">
        {/* Start Button */}
        <div ref={startRef}>
          <button
            type="button"
            className={`taskbar-start-btn ${showStart ? 'active' : ''}`}
            onClick={() => setShowStart(v => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect width="7" height="7" fill="#FF0000" />
              <rect x="9" width="7" height="7" fill="#00FF00" />
              <rect y="9" width="7" height="7" fill="#0000FF" />
              <rect x="9" y="9" width="7" height="7" fill="#FFFF00" />
            </svg>
            <strong>Start</strong>
          </button>
        </div>

        <div className="taskbar-divider" />

        {/* Window Buttons */}
        <div className="taskbar-windows">
          {windows?.map(win => (
            <button
              key={win.id}
              type="button"
              className={`taskbar-window-btn ${activeWindowId === win.id && !win.isMinimized ? 'active' : ''}`}
              onClick={() => onTaskbarClick?.(win.id)}
            >
              🖼️ {win.title}
            </button>
          ))}
        </div>

        {/* System Tray */}
        <div className="taskbar-tray">
          <div className="tray-icons">
            <span title="Network">🌐</span>
            <span title="Volume">🔊</span>
          </div>
          <div className="tray-clock" title={dateStr}>
            {timeStr}
          </div>
        </div>
          <button
            type="button"
            className={`taskbar-start-btn ${showStart ? 'active' : ''}`}
            onClick={() => setShowStart(v => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect width="7" height="7" fill="#FF0000" />
              <rect x="9" width="7" height="7" fill="#00FF00" />
              <rect y="9" width="7" height="7" fill="#0000FF" />
              <rect x="9" y="9" width="7" height="7" fill="#FFFF00" />
            </svg>
            <strong>Start</strong>
          </button>
        </div>

        <div className="taskbar-divider" />

        {/* Window Buttons */}
        <div className="taskbar-windows">
          {windows?.map(win => (
            <button
              key={win.id}
              type="button"
              className={`taskbar-window-btn ${activeWindowId === win.id && !win.isMinimized ? 'active' : ''}`}
              onClick={() => onTaskbarClick?.(win.id)}
            >
              🖼️ {win.title}
            </button>
          ))}
        </div>

        {/* System Tray */}
        <div className="taskbar-tray">
          <div className="tray-icons">
            <span title="Network">🌐</span>
            <span title="Volume">🔊</span>
          </div>
          <div className="tray-clock" title={dateStr}>
            {timeStr}
          </div>
        </div>
          <button
            type="button"
            className={`taskbar-start-btn ${showStart ? 'active' : ''}`}
            onClick={() => setShowStart(v => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect width="7" height="7" fill="#FF0000" />
              <rect x="9" width="7" height="7" fill="#00FF00" />
              <rect y="9" width="7" height="7" fill="#0000FF" />
              <rect x="9" y="9" width="7" height="7" fill="#FFFF00" />
            </svg>
            <strong>Start</strong>
          </button>
        </div>

        <div className="taskbar-divider" />

        {/* Window Buttons */}
        <div className="taskbar-windows">
          {windows?.map(win => (
            <button
              key={win.id}
              type="button"
              className={`taskbar-window-btn ${activeWindowId === win.id && !win.isMinimized ? 'active' : ''}`}
              onClick={() => onTaskbarClick?.(win.id)}
            >
              🖼️ {win.title}
            </button>
          ))}
        </div>

        {/* System Tray */}
        <div className="taskbar-tray">
          <div className="tray-icons">
            <span title="Network">🌐</span>
            <span title="Volume">🔊</span>
          </div>
          <div className="tray-clock" title={dateStr}>
            {timeStr}
          </div>
        </div>
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
    </>
  );
};

export default TaskbarComponent;
