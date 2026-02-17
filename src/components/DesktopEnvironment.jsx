import React, { useState, useCallback } from 'react';
import TaskbarComponent from './TaskbarComponent';
import DraggableWindow from './DraggableWindow';
import ConversionInterface from './ConversionInterface';

const INITIAL_WINDOWS = [
  {
    id: 'converter-window',
    title: 'RetroConverter',
    isMinimized: false,
    isMaximized: false,
    position: { x: 60, y: 30 },
    size: { width: 860, height: 540 },
    zIndex: 20,
  },
];
const DesktopEnvironment = () => {
  const [windows, setWindows] = useState([
    {
      id: 'converter-window',
      title: 'RetroConverter',
      isMinimized: false,
      isMaximized: false,
      position: { x: 80, y: 40 },
      size: { width: 860, height: 560 },
      zIndex: 20,
    },
  ]);

const DesktopIcon = ({ label, icon, onDoubleClick }) => (
  <div
    className="desktop-icon"
    onDoubleClick={onDoubleClick}
  >
    <div className="desktop-icon-img">{icon}</div>
    <span className="desktop-icon-label">{label}</span>
  </div>
);

const DesktopEnvironment = () => {
  const [windows, setWindows] = useState(INITIAL_WINDOWS);
  const [activeWindowId, setActiveWindowId] = useState('converter-window');
  const [zCounter, setZCounter] = useState(30);

  const bringToFront = useCallback((id) => {
    setActiveWindowId(id);
    setZCounter(prev => prev + 1);
    setWindows(prev =>
      prev.map(w => w.id === id ? { ...w, zIndex: zCounter + 1 } : w)
    );
  }, [zCounter]);

  const updateWindow = useCallback((id, patch) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...patch } : w));
  }, []);

  const handleTaskbarClick = useCallback((id) => {
    const win = windows.find(w => w.id === id);
    if (!win) return;
    if (win.isMinimized) {
      updateWindow(id, { isMinimized: false });
      bringToFront(id);
    } else if (activeWindowId === id) {
      updateWindow(id, { isMinimized: true });
    } else {
      bringToFront(id);
    }
  }, [windows, activeWindowId, updateWindow, bringToFront]);

  const openWindow = useCallback((id) => {
    const win = windows.find(w => w.id === id);
    if (win) {
      updateWindow(id, { isMinimized: false });
      bringToFront(id);
    }
  }, [windows, updateWindow, bringToFront]);

  return (
    <div className="desktop">
      {/* Desktop Icons */}
      <div className="desktop-icons-area">
        <DesktopIcon
          label="RetroConverter"
          onDoubleClick={() => openWindow('converter-window')}
          icon={(
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="2" fill="#1E90FF" />
              <text x="6" y="24" fontSize="20" fill="white" fontWeight="bold">R</text>
            </svg>
          )}
        />
        <DesktopIcon
          label="My Computer"
          onDoubleClick={() => {}}
          icon={(
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="4" width="28" height="20" rx="1" fill="#C0C0C0" stroke="#808080" strokeWidth="1.5" />
              <rect x="4" y="6" width="24" height="16" fill="#000080" />
              <rect x="10" y="24" width="12" height="3" fill="#808080" />
              <rect x="7" y="27" width="18" height="2" fill="#C0C0C0" />
            </svg>
          )}
        />
        <DesktopIcon
          label="Recycle Bin"
          onDoubleClick={() => {}}
          icon={(
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M8 10h16l-2 18H10L8 10z" fill="#C0C0C0" stroke="#808080" strokeWidth="1.5" />
              <path d="M6 10h20M12 10V7h8v3" stroke="#808080" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13 14v10M16 14v10M19 14v10" stroke="#808080" strokeWidth="1" />
            </svg>
          )}
        />
      </div>

      {/* Windows */}
      {windows
        .filter(w => !w.isMinimized)
        .map(win => (
          <DraggableWindow
            key={win.id}
            title={win.title}
            position={win.position}
            size={win.size}
            zIndex={win.zIndex}
            isMaximized={win.isMaximized}
            isActive={activeWindowId === win.id}
            onFocus={() => bringToFront(win.id)}
            onMinimize={() => updateWindow(win.id, { isMinimized: true })}
            onMaximize={() => updateWindow(win.id, { isMaximized: !win.isMaximized })}
            onClose={() => updateWindow(win.id, { isMinimized: true })}
            onPositionChange={(pos) => updateWindow(win.id, { position: pos })}
  const updateWindow = (id, patch) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  };

  const bringToFront = (id) => {
    setActiveWindowId(id);
    setWindows((prev) => prev.map((w) => ({ ...w, zIndex: w.id === id ? 50 : 20 })));
  };

  const handleTaskbarClick = (id) => {
    const win = windows.find((w) => w.id === id);
    if (!win) return;
    if (win.isMinimized) updateWindow(id, { isMinimized: false });
    bringToFront(id);
  };

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-b from-teal-700 to-teal-500 relative overflow-hidden">
      {windows
        .filter((w) => !w.isMinimized)
        .map((windowItem) => (
          <DraggableWindow
            key={windowItem.id}
            title={windowItem.title}
            position={windowItem.position}
            size={windowItem.size}
            zIndex={windowItem.zIndex}
            isMaximized={windowItem.isMaximized}
            isActive={activeWindowId === windowItem.id}
            onFocus={() => bringToFront(windowItem.id)}
            onMinimize={() => updateWindow(windowItem.id, { isMinimized: true })}
            onMaximize={() => updateWindow(windowItem.id, { isMaximized: !windowItem.isMaximized })}
            onClose={() => updateWindow(windowItem.id, { isMinimized: true })}
          >
            <ConversionInterface />
          </DraggableWindow>
        ))}

      {/* Taskbar */}
      <TaskbarComponent
        windows={windows}
        activeWindowId={activeWindowId}
        onTaskbarClick={handleTaskbarClick}
      />
      <TaskbarComponent windows={windows} activeWindowId={activeWindowId} onTaskbarClick={handleTaskbarClick} />
    </div>
  );
};

export default DesktopEnvironment;
