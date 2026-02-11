import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';

const TaskbarComponent = ({ windows, activeWindowId, onTaskbarClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    const hours = date?.getHours();
    const minutes = date?.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  return (
    <div className="taskbar">
      <button className="taskbar-start-button">
        <div className="taskbar-start-logo">
          <Icon name="Zap" size={12} color="#FFFFFF" />
        </div>
        <span>Start</span>
      </button>
      <div className="taskbar-divider" />
      <div className="flex-1 flex items-center gap-1 px-1">
        {windows?.map(window => (
          <button
            key={window?.id}
            className={`button-98 ${activeWindowId === window?.id ? 'active' : ''}`}
            onClick={() => onTaskbarClick(window?.id)}
            style={{
              borderColor: activeWindowId === window?.id 
                ? 'var(--color-shadow) var(--color-highlight) var(--color-highlight) var(--color-shadow)'
                : 'var(--color-highlight) var(--color-shadow) var(--color-shadow) var(--color-highlight)'
            }}
          >
            <Icon name="FileText" size={12} />
            <span className="truncate max-w-[120px]">{window?.title}</span>
          </button>
        ))}
      </div>
      <div className="taskbar-clock">
        <Icon name="Clock" size={12} className="mr-1" />
        {formatTime(currentTime)}
      </div>
    </div>
  );
};

export default TaskbarComponent;
