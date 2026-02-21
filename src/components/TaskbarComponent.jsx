import React, { useEffect, useState, useRef } from 'react';

const TaskbarComponent = ({ windows, activeWindowId, onTaskbarClick }) => {
  const [now, setNow] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const startRef = useRef();

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
      </div>
    </>
  );
};

export default TaskbarComponent;
