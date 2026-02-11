import React, { useState, useRef, useEffect } from 'react';
import Icon from './AppIcon';

const DraggableWindow = ({
  id,
  title,
  children,
  position,
  size,
  zIndex,
  isMaximized,
  isActive,
  onFocus,
  onMove,
  onResize,
  onMinimize,
  onMaximize,
  onClose
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e?.target?.closest('.window-controls')) return;
    
    setIsDragging(true);
    setDragOffset({
