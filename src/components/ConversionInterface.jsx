import React, { useState, useRef, useCallback } from 'react';
import React, { useMemo, useState } from 'react';

const formatsByCategory = {
  pdf: ['docx', 'txt', 'md'],
  image: ['png', 'jpg', 'webp'],
  audio: ['mp3', 'wav'],
  text: ['txt', 'pdf'],
};

// ─── Conversion Config ────────────────────────────────────────────────────────
const CATEGORIES = {
  image: {
    label: '🖼️ Image',
    accept: 'image/png,image/jpeg,image/webp,image/gif,image/bmp',
    formats: ['png', 'jpg', 'webp'],
    description: 'Convert between image formats',
  },
  audio: {
    label: '🎵 Audio',
    accept: 'audio/*',
    formats: ['mp3', 'wav', 'ogg'],
    description: 'Convert audio files',
  },
  document: {
    label: '📄 Document',
    accept: '.pdf,.txt,.md,.html,.csv',
    formats: ['txt', 'md', 'html', 'csv'],
    description: 'Convert document formats',
  },
};

// ─── Image Converter (client-side via Canvas) ─────────────────────────────────
async function convertImage(file, outputFormat) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      // White background for jpg
      if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' };
      const mime = mimeMap[outputFormat] || 'image/png';
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) resolve(blob);
        else reject(new Error('Conversion failed'));
      }, mime, 0.92);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

// ─── Text Converter ────────────────────────────────────────────────────────────
async function convertText(file, outputFormat) {
  const text = await file.text();
  let output = text;
  const inputExt = file.name.split('.').pop().toLowerCase();

  if (outputFormat === 'md' && inputExt === 'txt') {
    output = text;
  } else if (outputFormat === 'html' && (inputExt === 'txt' || inputExt === 'md')) {
    const lines = text.split('\n');
    const htmlLines = lines.map(line => {
      if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
      if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
      if (line.trim() === '') return '<br>';
      return `<p>${line}</p>`;
    });
    output = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Converted</title></head>
<body>
${htmlLines.join('\n')}
</body>
</html>`;
  } else if (outputFormat === 'txt') {
    output = text.replace(/<[^>]*>/g, '').replace(/#{1,6}\s/g, '');
  }

  return new Blob([output], { type: 'text/plain' });
}

// ─── Main Component ────────────────────────────────────────────────────────────
const ConversionInterface = () => {
  const [category, setCategory] = useState('image');
  const [outputFormat, setOutputFormat] = useState('png');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null); // { url, name, size }
  const [error, setError] = useState('');
  const [log, setLog] = useState([]);
  const fileInputRef = useRef();

  const addLog = (msg) => setLog(prev => [...prev.slice(-50), `> ${msg}`]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setOutputFormat(CATEGORIES[cat].formats[0]);
    setFile(null);
    setResult(null);
    setError('');
    setLog([]);
  };

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError('');
    addLog(`File selected: ${f.name} (${(f.size / 1024).toFixed(1)} KB)`);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, []);

  const handleConvert = async () => {
    if (!file) { setError('Please select a file first.'); return; }
    setIsConverting(true);
    setProgress(0);
    setResult(null);
    setError('');
    setLog([]);

    try {
      addLog(`Starting conversion: ${file.name} → .${outputFormat}`);
      setProgress(20);
      await new Promise(r => setTimeout(r, 300));

      let blob;
      setProgress(50);
      addLog('Processing...');

      if (category === 'image') {
        blob = await convertImage(file, outputFormat);
        addLog('Image converted successfully');
      } else if (category === 'document') {
        blob = await convertText(file, outputFormat);
        addLog('Document converted successfully');
      } else {
        // Audio - just rename (browser can't transcode audio natively)
        blob = file;
        addLog('Note: Audio transcoding requires server-side processing');
        addLog('File packaged as-is');
      }

      setProgress(90);
      await new Promise(r => setTimeout(r, 200));

      const outputName = file.name.replace(/\.[^.]+$/, '') + '.' + outputFormat;
      const url = URL.createObjectURL(blob);

      setResult({ url, name: outputName, size: (blob.size / 1024).toFixed(1) });
      addLog(`Done! Output: ${outputName} (${(blob.size / 1024).toFixed(1)} KB)`);
      setProgress(100);
    } catch (err) {
      setError(err.message || 'Conversion failed');
      addLog(`ERROR: ${err.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.name;
    a.click();
    addLog(`Downloaded: ${result.name}`);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError('');
    setProgress(0);
    setLog([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cat = CATEGORIES[category];

  return (
    <div className="converter-root">
      {/* Left Panel: Controls */}
      <div className="converter-left">
        {/* Category Tabs */}
        <div className="win98-group">
          <div className="win98-group-label">Category</div>
          <div className="category-tabs">
            {Object.entries(CATEGORIES).map(([key, val]) => (
              <button
                key={key}
                type="button"
                className={`win98-tab ${category === key ? 'active' : ''}`}
                onClick={() => handleCategoryChange(key)}
              >
                {val.label}
              </button>
            ))}
          </div>
        </div>

        {/* Output Format */}
        <div className="win98-group">
          <div className="win98-group-label">Output Format</div>
          <select
            className="win98-select"
            value={outputFormat}
            onChange={e => setOutputFormat(e.target.value)}
          >
            {cat.formats.map(f => (
              <option key={f} value={f}>.{f.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* File Drop Zone */}
        <div className="win98-group" style={{ flex: 1 }}>
          <div className="win98-group-label">Input File</div>
          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? (
              <div className="drop-zone-file">
                <div className="file-icon">📄</div>
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
            ) : (
              <div className="drop-zone-empty">
                <div style={{ fontSize: 28 }}>📂</div>
                <div>Click or drag file here</div>
                <div style={{ fontSize: 10, color: '#808080', marginTop: 4 }}>{cat.description}</div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={cat.accept}
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files?.[0])}
          />
        </div>

        {/* Action Buttons */}
        <div className="converter-actions">
          <button
            type="button"
            className="win98-button primary"
            onClick={handleConvert}
            disabled={isConverting || !file}
          >
            {isConverting ? '⏳ Converting...' : '▶ Convert'}
          </button>
          <button
            type="button"
            className="win98-button"
            onClick={handleReset}
            disabled={isConverting}
          >
            🔄 Reset
          </button>
          {result && (
            <button
              type="button"
              className="win98-button success"
              onClick={handleDownload}
            >
              💾 Download
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="win98-error">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Right Panel: Preview & Log */}
      <div className="converter-right">
        {/* Progress */}
        {(isConverting || progress > 0) && (
          <div className="win98-group">
            <div className="win98-group-label">Progress</div>
            <div className="win98-progress">
              <div
                className={`win98-progress-bar ${isConverting ? 'animated' : ''}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div style={{ fontSize: 10, textAlign: 'right', marginTop: 2 }}>{progress}%</div>
          </div>
        )}

        {/* Preview */}
        {result && category === 'image' && (
          <div className="win98-group">
            <div className="win98-group-label">Preview — {result.name} ({result.size} KB)</div>
            <div className="preview-area">
              <img src={result.url} alt="Preview" className="preview-img" />
            </div>
          </div>
        )}

        {result && category !== 'image' && (
          <div className="win98-group">
            <div className="win98-group-label">Output Ready</div>
            <div className="result-ready">
              <div style={{ fontSize: 32 }}>✅</div>
              <div style={{ fontWeight: 'bold', marginTop: 8 }}>{result.name}</div>
              <div style={{ color: '#008000', fontSize: 11 }}>{result.size} KB — Ready to download</div>
              <button
                type="button"
                className="win98-button success"
                onClick={handleDownload}
                style={{ marginTop: 12 }}
              >
                💾 Save File
              </button>
            </div>
          </div>
        )}

        {/* Log */}
        <div className="win98-group" style={{ flex: 1 }}>
          <div className="win98-group-label">Log</div>
          <div className="log-area">
            {log.length === 0 ? (
              <span style={{ color: '#808080' }}>Waiting for conversion...</span>
            ) : (
              log.map((line, i) => (
                <div key={i} className="log-line">{line}</div>
              ))
            )}
          </div>
        </div>

  const outputFormats = useMemo(() => formatsByCategory[selectedCategory] || ['txt'], [selectedCategory]);

  const onCategoryChange = (value) => {
    setSelectedCategory(value);
    setOutputFormat((formatsByCategory[value] || ['txt'])[0]);
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      window.alert('لطفا اول فایل را انتخاب کن.');
      return;
    }
    setIsConverting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsConverting(false);
    window.alert(`تبدیل آزمایشی انجام شد: ${selectedFile.name} → ${outputFormat}`);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">RetroConverter</h2>
      <p className="text-sm text-slate-700">نسخه پایدار رابط برای GitHub Pages</p>

      <div className="grid gap-3 max-w-xl">
        <label className="text-sm font-medium">دسته‌بندی</label>
        <select value={selectedCategory} onChange={(e) => onCategoryChange(e.target.value)} className="border border-slate-400 rounded px-3 py-2 bg-white">
          {Object.keys(formatsByCategory).map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>

        <label className="text-sm font-medium">فرمت خروجی</label>
        <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} className="border border-slate-400 rounded px-3 py-2 bg-white">
          {outputFormats.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <label className="text-sm font-medium">فایل ورودی</label>
        <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="border border-slate-400 rounded px-3 py-2 bg-white" />

        <button
          type="button"
          onClick={handleConvert}
          disabled={isConverting}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
        >
          {isConverting ? 'در حال تبدیل...' : 'شروع تبدیل'}
        </button>
      </div>
    </div>
  );
};

export default ConversionInterface;
