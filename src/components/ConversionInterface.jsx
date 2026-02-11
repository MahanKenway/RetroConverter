import React, { useMemo, useState } from 'react';

const formatsByCategory = {
  pdf: ['docx', 'txt', 'md'],
  image: ['png', 'jpg', 'webp'],
  audio: ['mp3', 'wav'],
  text: ['txt', 'pdf'],
};

const ConversionInterface = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('pdf');
  const [outputFormat, setOutputFormat] = useState('docx');
  const [isConverting, setIsConverting] = useState(false);

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
