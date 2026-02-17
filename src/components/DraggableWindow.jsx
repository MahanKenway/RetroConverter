import React, { useRef, useCallback } from 'react';
import React from 'react';
import Icon from './AppIcon';

const DraggableWindow = ({
  title,
  children,
  position,
  size,
  zIndex,
  isMaximized,
  isMinimized,
  isActive,
  onFocus,
  onMinimize,
  onMaximize,
  onClose,
  onPositionChange,
}) => {
  const windowRef = useRef(null);
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, startLeft: 0, startTop: 0 });

  const onMouseDown = useCallback((e) => {
    if (isMaximized) return;
    e.preventDefault();
    onFocus?.();
    const rect = windowRef.current?.getBoundingClientRect();
    dragState.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: rect?.left ?? position?.x ?? 80,
      startTop: rect?.top ?? position?.y ?? 40,
    };

    const onMouseMove = (e) => {
      if (!dragState.current.dragging) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      const newLeft = Math.max(0, dragState.current.startLeft + dx);
      const newTop = Math.max(0, dragState.current.startTop + dy);
      if (windowRef.current) {
        windowRef.current.style.left = `${newLeft}px`;
        windowRef.current.style.top = `${newTop}px`;
      }
    };

    const onMouseUp = (e) => {
      if (!dragState.current.dragging) return;
      dragState.current.dragging = false;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      const newLeft = Math.max(0, dragState.current.startLeft + dx);
      const newTop = Math.max(0, dragState.current.startTop + dy);
      onPositionChange?.({ x: newLeft, y: newTop });
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [isMaximized, onFocus, onPositionChange, position]);

  // Touch support for mobile
  const onTouchStart = useCallback((e) => {
    if (isMaximized) return;
    onFocus?.();
    const touch = e.touches[0];
    const rect = windowRef.current?.getBoundingClientRect();
    dragState.current = {
      dragging: true,
      startX: touch.clientX,
      startY: touch.clientY,
      startLeft: rect?.left ?? position?.x ?? 80,
      startTop: rect?.top ?? position?.y ?? 40,
    };

    const onTouchMove = (e) => {
      if (!dragState.current.dragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - dragState.current.startX;
      const dy = touch.clientY - dragState.current.startY;
      const newLeft = Math.max(0, dragState.current.startLeft + dx);
      const newTop = Math.max(0, dragState.current.startTop + dy);
      if (windowRef.current) {
        windowRef.current.style.left = `${newLeft}px`;
        windowRef.current.style.top = `${newTop}px`;
      }
    };

    const onTouchEnd = () => {
      if (!dragState.current.dragging) return;
      dragState.current.dragging = false;
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  }, [isMaximized, onFocus, position]);

  const style = isMaximized
    ? { left: 0, top: 0, width: '100%', height: 'calc(100vh - 40px)', zIndex, position: 'absolute' }
    : {
      left: position?.x ?? 80,
      top: position?.y ?? 40,
      width: size?.width ?? 860,
      height: size?.height ?? 560,
      zIndex,
      position: 'absolute',
      maxWidth: '100vw',
      maxHeight: 'calc(100vh - 50px)',
    };

  return (
    <div
      ref={windowRef}
      className={`win98-window ${isActive ? 'active' : ''}`}
      style={style}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div
        className={`win98-titlebar ${isActive ? 'active' : 'inactive'}`}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div className="win98-titlebar-icon">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="1" fill="#00AAFF" stroke="#0044AA" strokeWidth="1" />
            <text x="3" y="12" fontSize="10" fill="white" fontWeight="bold">R</text>
          </svg>
        </div>
        <span className="win98-titlebar-title">{title}</span>
        <div className="win98-controls">
          <button
            type="button"
            className="win98-btn win98-btn-minimize"
            onClick={(e) => { e.stopPropagation(); onMinimize?.(); }}
            title="Minimize"
          >
            <span style={{ display: 'block', width: 8, height: 2, background: 'black', marginTop: 8 }} />
          </button>
          <button
            type="button"
            className="win98-btn win98-btn-maximize"
            onClick={(e) => { e.stopPropagation(); onMaximize?.(); }}
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? (
              <Icon name="Minimize2" size={10} />
            ) : (
              <Icon name="Maximize2" size={10} />
            )}
          </button>
          <button
            type="button"
            className="win98-btn win98-btn-close"
            onClick={(e) => { e.stopPropagation(); onClose?.(); }}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="win98-menubar">
        <span className="win98-menuitem">File</span>
        <span className="win98-menuitem">View</span>
        <span className="win98-menuitem">Help</span>
      </div>

      {/* Content */}
      <div className="win98-content">
        {children}
      </div>

      {/* Status Bar */}
      <div className="win98-statusbar">
        <span>Ready</span>
      </div>
}) => {
  const style = isMaximized
    ? { left: 0, top: 0, width: '100%', height: 'calc(100% - 40px)', zIndex }
    : { left: position?.x ?? 80, top: position?.y ?? 60, width: size?.width ?? 720, height: size?.height ?? 520, zIndex };

  return (
    <div
      className={`absolute border-2 border-slate-500 bg-slate-100 shadow-xl ${isActive ? 'ring-2 ring-blue-500' : ''}`}
      style={style}
      onMouseDown={onFocus}
    >
      <div className="flex items-center justify-between bg-blue-700 text-white px-2 py-1 select-none">
        <div className="font-semibold text-sm truncate">{title}</div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onMinimize} className="w-6 h-6 bg-slate-200 text-black border border-slate-600 grid place-items-center">_</button>
          <button type="button" onClick={onMaximize} className="w-6 h-6 bg-slate-200 text-black border border-slate-600 grid place-items-center">
            <Icon name={isMaximized ? 'Minimize2' : 'Maximize2'} size={12} />
          </button>
          <button type="button" onClick={onClose} className="w-6 h-6 bg-red-600 text-white border border-red-900 grid place-items-center">×</button>
        </div>
      </div>
      <div className="h-[calc(100%-34px)] overflow-auto bg-slate-100">{children}</div>
    </div>
  );
};

export default DraggableWindow;
