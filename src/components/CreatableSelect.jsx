import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check, X } from 'lucide-react';

/**
 * CreatableSelect - Yangi kategoriya kiritish yoki mavjudlaridan tanlash imkonini beruvchi komponent
 */
const CreatableSelect = ({
  label = "Kategoriya",
  options = [],
  value = "",
  onChange,
  placeholder = "Kategoriyani tanlang yoki yangisini yozing...",
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const isExactMatch = options.some(
    (opt) => opt.toLowerCase() === searchTerm.toLowerCase().trim()
  );

  const canCreate = searchTerm.trim().length > 0 && !isExactMatch;

  const handleSelect = (val) => {
    onChange(val);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleCreate = () => {
    if (searchTerm.trim()) {
      onChange(searchTerm.trim());
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (canCreate) {
        handleCreate();
      } else if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-1.5 relative" ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      {/* Main trigger input */}
      <div
        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900 text-slate-100 cursor-pointer focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition shadow-sm"
        onClick={() => setIsOpen(true)}
      >
        <span className={`text-sm truncate ${value ? 'text-slate-100 font-medium' : 'text-slate-500'}`}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
              title="Tozalash"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden p-2">
          {/* Search / New Input */}
          <div className="mb-2">
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Qidiring yoki yangi yozing..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Create new option prompt */}
          {canCreate && (
            <button
              type="button"
              onClick={handleCreate}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg font-medium transition mb-1 text-left"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Yangi kategoriya qo'shish: <strong>"{searchTerm.trim()}"</strong></span>
            </button>
          )}

          {/* List of existing options */}
          <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = value === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : !canCreate ? (
              <div className="p-3 text-center text-xs text-slate-500">
                Kategoriyalar topilmadi. Yuqorida yangisini yozing.
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatableSelect;
