import React from 'react';
import Icon from './AppIcon';

const DraggableWindow = ({
  title,
  children,
  position,
  size,
  zIndex,
  isMaximized,
  isActive,
  onFocus,
  onMinimize,
  onMaximize,
  onClose,
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
