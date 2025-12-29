import { useRef, useCallback, useState, useEffect } from "react";
import { Bold, Italic, List, ListOrdered, Link, Heading1, Heading2, Heading3, Undo, Redo, AlignLeft, AlignCenter, AlignRight, ChevronDown } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, className = "" }: RichTextEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<"rtl" | "ltr">("rtl");
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });
  const isInternalUpdate = useRef(false);

  // Auto-detect direction based on content
  const getDirection = (text: string) => {
    if (!text) return "rtl";
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text.slice(0, 20)) ? "rtl" : "ltr";
  };

  // Update active format states
  const updateActiveFormats = useCallback(() => {
    if (document.queryCommandState) {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
      });
    }
  }, []);

  // Sync value to editor content safely
  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      if (editorRef.current.innerHTML !== value) {
        if (document.activeElement !== editorRef.current) {
          editorRef.current.innerHTML = value;
          const stripedHtml = value.replace(/<[^>]+>/g, '');
          if (stripedHtml.trim().length > 0) {
            setDirection(getDirection(stripedHtml));
          }
        }
      }
    }
  }, [value]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
    setTimeout(updateActiveFormats, 0);
  }, [onChange, updateActiveFormats]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerText;
      const newDir = getDirection(content);
      if (newDir !== direction) {
        setDirection(newDir);
      }
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
      updateActiveFormats();
    }
  }, [onChange, direction, updateActiveFormats]);

  const handleLink = useCallback(() => {
    const url = prompt("أدخل رابط URL:", "https://");
    if (url) {
      execCommand("createLink", url);
    }
  }, [execCommand]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    handleInput();
  }, [handleInput]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      execCommand("bold");
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      execCommand("italic");
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      execCommand("underline");
    }
  }, [execCommand]);

  const ToolbarButton = ({
    onClick,
    children,
    title,
    isActive = false,
  }: {
    onClick: () => void;
    children: React.ReactNode;
    title: string;
    isActive?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${
        isActive
          ? "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
      }`}
    >
      {children}
    </button>
  );

  const FormatDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formats = [
      { label: direction === 'rtl' ? 'عادي' : 'Normal', cmd: 'formatBlock', value: 'p' },
      { label: direction === 'rtl' ? 'عنوان 1' : 'Heading 1', cmd: 'formatBlock', value: 'h1' },
      { label: direction === 'rtl' ? 'عنوان 2' : 'Heading 2', cmd: 'formatBlock', value: 'h2' },
      { label: direction === 'rtl' ? 'عنوان 3' : 'Heading 3', cmd: 'formatBlock', value: 'h3' },
    ];

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 flex items-center gap-1"
          title={direction === 'rtl' ? 'حجم الخط' : 'Font Size'}
        >
          {direction === 'rtl' ? 'التنسيق' : 'Format'}
          <ChevronDown className="w-3 h-3" />
        </button>
        {isOpen && (
          <div className="absolute top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 min-w-[120px]">
            {formats.map((format) => (
              <button
                key={format.value}
                type="button"
                onClick={() => {
                  execCommand(format.cmd, format.value);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm"
              >
                {format.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`flex flex-col rounded-lg border border-border overflow-hidden bg-background h-full ${className}`}>
      {/* Toolbar - Sticky within container */}
      <div 
        ref={toolbarRef}
        className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-40"
      >
        <FormatDropdown />

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton 
          onClick={() => execCommand("bold")} 
          title={direction === 'rtl' ? 'عريض (Ctrl+B)' : 'Bold (Ctrl+B)'}
          isActive={activeFormats.bold}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton 
          onClick={() => execCommand("italic")} 
          title={direction === 'rtl' ? 'مائل (Ctrl+I)' : 'Italic (Ctrl+I)'}
          isActive={activeFormats.italic}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton 
          onClick={() => execCommand("underline")} 
          title={direction === 'rtl' ? 'تحت الخط' : 'Underline (Ctrl+U)'}
          isActive={activeFormats.underline}
        >
          <span className="w-4 h-4 flex items-center justify-center text-sm font-bold underline">U</span>
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton 
          onClick={() => execCommand("justifyLeft")} 
          title={direction === 'rtl' ? 'محاذاة لليسار' : 'Align Left'}
          isActive={activeFormats.justifyLeft}
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton 
          onClick={() => execCommand("justifyCenter")} 
          title={direction === 'rtl' ? 'توسيط' : 'Center'}
          isActive={activeFormats.justifyCenter}
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton 
          onClick={() => execCommand("justifyRight")} 
          title={direction === 'rtl' ? 'محاذاة لليمين' : 'Align Right'}
          isActive={activeFormats.justifyRight}
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton 
          onClick={() => execCommand("insertUnorderedList")} 
          title={direction === 'rtl' ? 'قائمة نقطية' : 'Bullet List'}
          isActive={activeFormats.insertUnorderedList}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton 
          onClick={() => execCommand("insertOrderedList")} 
          title={direction === 'rtl' ? 'قائمة مرقمة' : 'Numbered List'}
          isActive={activeFormats.insertOrderedList}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton onClick={handleLink} title={direction === 'rtl' ? 'إضافة رابط' : 'Add Link'}>
          <Link className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton onClick={() => execCommand("undo")} title={direction === 'rtl' ? 'تراجع' : 'Undo'}>
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton onClick={() => execCommand("redo")} title={direction === 'rtl' ? 'إعادة' : 'Redo'}>
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor Area - Scrollable */}
      <div className="flex-1 bg-white dark:bg-zinc-950 cursor-text overflow-y-auto">
        <div
          ref={editorRef}
          contentEditable
          dir={direction}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onMouseUp={updateActiveFormats}
          onKeyUp={updateActiveFormats}
          data-placeholder={placeholder}
          className={`
            min-h-[300px] p-6 focus:outline-none max-w-none 
            prose prose-sm dark:prose-invert 
            prose-p:my-3 prose-headings:my-4 prose-ul:my-2 prose-ol:my-2
            ${direction === 'rtl' ? 'text-right' : 'text-left'}
            [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400
            [&:focus]:outline-none
          `}
          style={{
            fontFamily: direction === 'rtl' ? 'inherit' : 'Inter, sans-serif'
          }}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
