import React, { useState } from 'react';
import TaskbarComponent from './TaskbarComponent';
import DraggableWindow from './DraggableWindow';
import ConversionInterface from './ConversionInterface';

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

  const [activeWindowId, setActiveWindowId] = useState('converter-window');

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

      <TaskbarComponent windows={windows} activeWindowId={activeWindowId} onTaskbarClick={handleTaskbarClick} />
    </div>
  );
};

export default DesktopEnvironment;
