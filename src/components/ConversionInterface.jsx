import React, { useState, useRef, useCallback, useEffect } from 'react';
import { saveToHistory } from '../utils/history';

// ─── PDF-lib via CDN ──────────────────────────────────────────────────────────
async function getPDFLib() {
  if (window.__pdfLib) return window.__pdfLib;
  const mod = await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.esm.min.js');
  window.__pdfLib = mod;
  return mod;
}

// ─── Converters ───────────────────────────────────────────────────────────────
async function convertImage(file, outputFormat) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' };
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        blob ? resolve(blob) : reject(new Error('Conversion failed'));
      }, mimeMap[outputFormat] || 'image/png', 0.92);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

async function imageToPDF(file) {
  const { PDFDocument } = await getPDFLib();
  const pdfDoc = await PDFDocument.create();
  let imgBytes = await file.arrayBuffer();
  let img;
  if (file.type === 'image/jpeg') {
    img = await pdfDoc.embedJpg(imgBytes);
  } else {
    const blob = await convertImage(file, 'png');
    imgBytes = await blob.arrayBuffer();
    img = await pdfDoc.embedPng(imgBytes);
  }
  const page = pdfDoc.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

async function mergePDFs(files) {
  const { PDFDocument } = await getPDFLib();
  const mergedPdf = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(p => mergedPdf.addPage(p));
  }
  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

async function splitPDF(file, fromPage, toPage) {
  const { PDFDocument } = await getPDFLib();
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const total = pdf.getPageCount();
  const from = Math.max(0, (fromPage || 1) - 1);
  const to = Math.min(total - 1, (toPage || total) - 1);
  const newPdf = await PDFDocument.create();
  const indices = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const pages = await newPdf.copyPages(pdf, indices);
  pages.forEach(p => newPdf.addPage(p));
  const pdfBytes = await newPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

async function convertText(file, outputFormat) {
  const text = await file.text();
  const inputExt = file.name.split('.').pop().toLowerCase();
  let output = text;
  let mime = 'text/plain';

  if (outputFormat === 'html') {
    mime = 'text/html';
    const lines = text.split('\n');
    const html = lines.map(l => {
      if (l.startsWith('# ')) return `<h1>${l.slice(2)}</h1>`;
      if (l.startsWith('## ')) return `<h2>${l.slice(3)}</h2>`;
      if (l.startsWith('### ')) return `<h3>${l.slice(4)}</h3>`;
      if (l.trim() === '') return '<br>';
      return `<p>${l}</p>`;
    });
    output = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6}</style></head><body>${html.join('\n')}</body></html>`;
  } else if (outputFormat === 'txt') {
    output = text.replace(/<[^>]*>/g, '').replace(/#{1,6}\s/g, '').replace(/\*\*/g, '');
  } else if (outputFormat === 'json' && inputExt === 'csv') {
    const lines = text.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/"/g, ''));
      return headers.reduce((obj, h, i) => ({ ...obj, [h]: vals[i] || '' }), {});
    });
    output = JSON.stringify(rows, null, 2);
    mime = 'application/json';
  } else if (outputFormat === 'csv' && inputExt === 'json') {
    const data = JSON.parse(text);
    const arr = Array.isArray(data) ? data : [data];
    const headers = Object.keys(arr[0] || {});
    const csvRows = [headers.join(','), ...arr.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))];
    output = csvRows.join('\n');
  }

  return new Blob([output], { type: mime });
}

// ─── Image Editor ─────────────────────────────────────────────────────────────
const ImageEditor = ({ file, onClose }) => {
  const canvasRef = useRef();
  const imgRef = useRef(null);
  const [s, setS] = useState({ brightness: 100, contrast: 100, saturation: 100, rotation: 0, flipH: false, flipV: false });
  const [origSize, setOrigSize] = useState({ w: 0, h: 0 });
  const [rW, setRW] = useState('');
  const [rH, setRH] = useState('');
  const [customW, setCustomW] = useState(null);
  const [customH, setCustomH] = useState(null);

  const render = useCallback((img, settings, cW, cH) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const tw = cW || img.width;
    const th = cH || img.height;
    const rad = (settings.rotation * Math.PI) / 180;
    const rot90 = settings.rotation === 90 || settings.rotation === 270;
    canvas.width = rot90 ? th : tw;
    canvas.height = rot90 ? tw : th;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.scale(settings.flipH ? -1 : 1, settings.flipV ? -1 : 1);
    ctx.drawImage(img, -tw / 2, -th / 2, tw, th);
    ctx.restore();
  }, []);

  useEffect(() => {
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      imgRef.current = img;
      setOrigSize({ w: img.width, h: img.height });
      setRW(String(img.width));
      setRH(String(img.height));
      render(img, s, null, null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [file, render, s]);

  const update = (key, val) => {
    const next = { ...s, [key]: val };
    setS(next);
    render(imgRef.current, next, customW, customH);
  };

  const applyResize = () => {
    const w = parseInt(rW, 10);
    const h = parseInt(rH, 10);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      setCustomW(w);
      setCustomH(h);
      render(imgRef.current, s, w, h);
    }
  };

  const download = () => {
    canvasRef.current?.toBlob(blob => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (file?.name?.replace(/\.[^.]+$/, '') || 'edited') + '_edited.png';
      a.click();
    }, 'image/png');
  };

  return (
    <div className="image-editor">
      <div className="editor-controls">
        <div className="win98-group">
          <div className="win98-group-label">Adjustments</div>
          {[['Brightness', 'brightness'], ['Contrast', 'contrast'], ['Saturation', 'saturation']].map(([label, key]) => (
            <div key={key} className="slider-row">
              <label>{label}</label>
              <input type="range" min="0" max="200" value={s[key]} onChange={e => update(key, Number(e.target.value))} />
              <span>{s[key]}%</span>
            </div>
          ))}
        </div>

        <div className="win98-group">
          <div className="win98-group-label">Transform</div>
          <div className="btn-row">
            <button type="button" className="win98-button" onClick={() => update('rotation', (s.rotation + 90) % 360)}>↻ 90°</button>
            <button type="button" className="win98-button" onClick={() => update('rotation', (s.rotation - 90 + 360) % 360)}>↺ -90°</button>
          </div>
          <div className="btn-row" style={{ marginTop: 4 }}>
            <button type="button" className="win98-button" onClick={() => update('flipH', !s.flipH)}>⇄ Flip H</button>
            <button type="button" className="win98-button" onClick={() => update('flipV', !s.flipV)}>⇅ Flip V</button>
          </div>
        </div>

        <div className="win98-group">
          <div className="win98-group-label">Resize (orig: {origSize.w}×{origSize.h})</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <input className="win98-input" style={{ width: 54 }} value={rW} onChange={e => setRW(e.target.value)} placeholder="W" />
            <span>×</span>
            <input className="win98-input" style={{ width: 54 }} value={rH} onChange={e => setRH(e.target.value)} placeholder="H" />
            <button type="button" className="win98-button" onClick={applyResize}>✓</button>
          </div>
        </div>

        <div style={{ padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button type="button" className="win98-button success" onClick={download}>💾 Save PNG</button>
          <button type="button" className="win98-button" onClick={onClose}>✕ Close Editor</button>
        </div>
      </div>
      <div className="editor-canvas-area">
        <canvas ref={canvasRef} className="editor-canvas" />
      </div>
    </div>
  );
};

// ─── Categories ───────────────────────────────────────────────────────────────
const CATS = {
  image: { label: '🖼️ Image', accept: 'image/png,image/jpeg,image/webp,image/gif', formats: ['png', 'jpg', 'webp', 'pdf'], desc: 'Convert & edit images', multi: false },
  pdf: { label: '📄 PDF', accept: 'application/pdf,image/png,image/jpeg', formats: ['merge', 'split'], desc: 'Merge or split PDFs', multi: true },
  document: { label: '📝 Document', accept: '.txt,.md,.html,.csv,.json', formats: ['txt', 'md', 'html', 'csv', 'json'], desc: 'Convert text & data', multi: false },
  audio: { label: '🎵 Audio', accept: 'audio/*', formats: ['mp3', 'wav', 'ogg'], desc: 'Audio files', multi: false },
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const ConversionInterface = () => {
  const [cat, setCat] = useState('image');
  const [fmt, setFmt] = useState('png');
  const [files, setFiles] = useState([]);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [results, setResults] = useState([]);
  const [err, setErr] = useState('');
  const [log, setLog] = useState([]);
  const [editor, setEditor] = useState(false);
  const [sFrom, setSFrom] = useState('1');
  const [sTo, setSTo] = useState('');
  const fileRef = useRef();

  const addLog = msg => setLog(p => [...p.slice(-80), `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const changeCat = c => {
    setCat(c);
    setFmt(CATS[c].formats[0]);
    setFiles([]);
    setResults([]);
    setErr('');
    setLog([]);
    setEditor(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const pickFiles = fs => {
    const a = Array.from(fs);
    setFiles(a);
    setResults([]);
    setErr('');
    a.forEach(f => addLog(`📂 ${f.name} (${(f.size / 1024).toFixed(1)} KB)`));
  };

  const handleDrop = useCallback(e => {
    e.preventDefault();
    setDrag(false);
    pickFiles(e.dataTransfer.files);
  }, []);

  const convert = async () => {
    if (!files.length) {
      setErr('Please select a file first.');
      return;
    }
    setBusy(true);
    setPct(10);
    setResults([]);
    setErr('');
    setLog([]);
    try {
      addLog(`🚀 ${files.map(f => f.name).join(', ')} → ${fmt.toUpperCase()}`);
      setPct(35);
      let blobs = [];

      if (cat === 'image') {
        if (fmt === 'pdf') {
          addLog('Image → PDF...');
          blobs = [{ blob: await imageToPDF(files[0]), name: files[0].name.replace(/\.[^.]+$/, '') + '.pdf' }];
        } else {
          addLog('Converting image...');
          blobs = [{ blob: await convertImage(files[0], fmt), name: files[0].name.replace(/\.[^.]+$/, '') + '.' + fmt }];
        }
      } else if (cat === 'pdf') {
        if (fmt === 'merge') {
          if (files.length < 2) throw new Error('Select at least 2 PDF files to merge');
          addLog(`Merging ${files.length} PDFs...`);
          blobs = [{ blob: await mergePDFs(files), name: 'merged.pdf' }];
        } else {
          addLog(`Splitting pages ${sFrom}–${sTo || 'end'}...`);
          blobs = [{ blob: await splitPDF(files[0], parseInt(sFrom, 10), parseInt(sTo, 10) || undefined), name: files[0].name.replace('.pdf', `_p${sFrom}-${sTo || 'end'}.pdf`) }];
        }
      } else if (cat === 'document') {
        addLog('Converting document...');
        blobs = [{ blob: await convertText(files[0], fmt), name: files[0].name.replace(/\.[^.]+$/, '') + '.' + fmt }];
      } else {
        blobs = [{ blob: files[0], name: files[0].name.replace(/\.[^.]+$/, '') + '.' + fmt }];
        addLog('⚠️ Audio: browser cannot transcode, file renamed only.');
      }

      setPct(90);
      await new Promise(r => setTimeout(r, 150));
      const final = blobs.map(b => ({ ...b, url: URL.createObjectURL(b.blob), size: (b.blob.size / 1024).toFixed(1) }));
      setResults(final);
      final.forEach(r => {
        addLog(`✅ ${r.name} (${r.size} KB)`);
        saveToHistory({
          category: cat,
          input: files.map(f => f.name).join(', '),
          output: r.name,
          sizeKb: r.size,
          mode: fmt,
        });
      });
      setPct(100);
    } catch (e) {
      setErr(e.message || 'Conversion failed');
      addLog(`❌ ${e.message}`);
      setPct(0);
    } finally {
      setBusy(false);
    }
  };

  const downloadAll = () => results.forEach(r => {
    const a = document.createElement('a');
    a.href = r.url;
    a.download = r.name;
    a.click();
  });

  const reset = () => {
    setFiles([]);
    setResults([]);
    setErr('');
    setPct(0);
    setLog([]);
    setEditor(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const category = CATS[cat];

  if (editor && files[0]) return <ImageEditor file={files[0]} onClose={() => setEditor(false)} />;

  return (
    <div className="converter-root">
      {/* LEFT */}
      <div className="converter-left">
        <div className="win98-group">
          <div className="win98-group-label">Category</div>
          <div className="category-tabs">
            {Object.entries(CATS).map(([k, v]) => (
              <button key={k} type="button" className={`win98-tab ${cat === k ? 'active' : ''}`} onClick={() => changeCat(k)}>{v.label}</button>
            ))}
          </div>
        </div>

        <div className="win98-group">
          <div className="win98-group-label">Output / Action</div>
          <select className="win98-select" value={fmt} onChange={e => setFmt(e.target.value)}>
            {category.formats.map(f => (
              <option key={f} value={f}>{f === 'merge' ? '🔗 Merge PDFs' : f === 'split' ? '✂️ Split PDF' : '.' + f.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {cat === 'pdf' && fmt === 'split' && (
          <div className="win98-group">
            <div className="win98-group-label">Page Range</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span>From:</span>
              <input className="win98-input" style={{ width: 44 }} value={sFrom} onChange={e => setSFrom(e.target.value)} />
              <span>To:</span>
              <input className="win98-input" style={{ width: 44 }} value={sTo} onChange={e => setSTo(e.target.value)} placeholder="end" />
            </div>
          </div>
        )}

        <div className="win98-group" style={{ flex: 1 }}>
          <div className="win98-group-label">Input {category.multi ? '(multiple)' : 'File'}</div>
          <div
            className={`drop-zone ${drag ? 'dragging' : ''} ${files.length ? 'has-file' : ''}`}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            {files.length > 0 ? (
              files.length === 1 ? (
                <div className="drop-zone-file">
                  <div className="file-icon">{category.label.split(' ')[0]}</div>
                  <div className="file-info">
                    <div className="file-name">{files[0].name}</div>
                    <div className="file-size">{(files[0].size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22 }}>📁</div>
                  <div style={{ fontWeight: 'bold', marginTop: 4 }}>{files.length} files</div>
                  <div style={{ fontSize: 10, color: '#808080' }}>{(files.reduce((s, f) => s + f.size, 0) / 1024).toFixed(1)} KB total</div>
                </div>
              )
            ) : (
              <div className="drop-zone-empty">
                <div style={{ fontSize: 28 }}>📂</div>
                <div>Click or drag file here</div>
                <div style={{ fontSize: 10, color: '#808080', marginTop: 4 }}>{category.desc}</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept={category.accept} multiple={category.multi} style={{ display: 'none' }} onChange={e => pickFiles(e.target.files)} />
        </div>

        <div className="converter-actions">
          <button type="button" className="win98-button primary" onClick={convert} disabled={busy || !files.length}>
            {busy ? '⏳ Converting...' : '▶ Convert'}
          </button>
          {cat === 'image' && files.length > 0 && (
            <button type="button" className="win98-button" onClick={() => setEditor(true)}>🎨 Image Editor</button>
          )}
          {results.length > 0 && (
            <button type="button" className="win98-button success" onClick={downloadAll}>
              💾 Download{results.length > 1 ? ' All' : ''}
            </button>
          )}
          <button type="button" className="win98-button" onClick={reset} disabled={busy}>🔄 Reset</button>
        </div>

        {err && <div className="win98-error">⚠️ {err}</div>}
      </div>

      {/* RIGHT */}
      <div className="converter-right">
        {(busy || (pct > 0 && pct < 100)) && (
          <div className="win98-group">
            <div className="win98-group-label">Progress</div>
            <div className="win98-progress">
              <div className={`win98-progress-bar ${busy ? 'animated' : ''}`} style={{ width: `${pct}%` }} />
            </div>
            <div style={{ fontSize: 10, textAlign: 'right', marginTop: 2 }}>{pct}%</div>
          </div>
        )}

        {results.length > 0 && (
          <div className="win98-group">
            <div className="win98-group-label">Output — {results.length} file(s) ready</div>
            <div className="results-list">
              {results.map((r, i) => (
                <div key={i} className="result-item">
                  {cat === 'image' && fmt !== 'pdf' && (
                    <img src={r.url} alt="preview" className="preview-thumb" />
                  )}
                  <div className="result-info">
                    <div className="result-name">{r.name}</div>
                    <div className="result-size">{r.size} KB</div>
                  </div>
                  <button
                    type="button"
                    className="win98-button success"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = r.url;
                      a.download = r.name;
                      a.click();
                    }}
                  >
                    💾
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="win98-group" style={{ flex: 1 }}>
          <div className="win98-group-label">Log</div>
          <div className="log-area">
            {log.length === 0
              ? <span style={{ color: '#555' }}>RetroConverter v2.0 ready...</span>
              : log.map((l, i) => <div key={i} className="log-line">{l}</div>)}
          </div>
        </div>

        <div className="win98-group">
          <div className="win98-group-label">Supported Conversions</div>
          <div className="info-grid">
            {['🖼️ PNG ↔ JPG ↔ WebP', '🖼️ Image → PDF', '📄 Merge PDFs', '✂️ Split PDF', '📝 TXT ↔ MD ↔ HTML', '📊 CSV ↔ JSON', '🎨 Image Editor (Brightness/Contrast/Rotate/Resize)', '🎵 Audio (rename)'].map((t, i) => (
              <div key={i} className="info-item">{t}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionInterface;
