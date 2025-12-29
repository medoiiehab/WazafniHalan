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
  const [toolbarPosition, setToolbarPosition] = useState<"relative" | "fixed">("relative");
  const [toolbarTop, setToolbarTop] = useState(0);
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
    // Check key characters to determine direction
    // If the first few characters contain Arabic, it's RTL.
    return arabicPattern.test(text.slice(0, 20)) ? "rtl" : "ltr";
  };

  // Update active format states
  const updateActiveFormats = useCallback(() => {
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
  }, []);

  // Handle sticky toolbar on scroll - relative to modal container
  useEffect(() => {
    // Find the scrollable parent (modal container)
    const findScrollableParent = (element: HTMLElement | null): HTMLElement | null => {
      let parent = element?.parentElement || null;
      while (parent) {
        const { overflow, overflowY } = window.getComputedStyle(parent);
        if (overflow === 'auto' || overflow === 'scroll' || overflowY === 'auto' || overflowY === 'scroll') {
          return parent;
        }
        parent = parent.parentElement;
      }
      return null;
    };

    const scrollableParent = findScrollableParent(toolbarRef.current);

    const handleScroll = () => {
      if (containerRef.current && toolbarRef.current && scrollableParent) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const parentRect = scrollableParent.getBoundingClientRect();
        
        // Check if container is scrolled past the top of the scrollable parent
        if (containerRect.top <= parentRect.top) {
          setToolbarPosition("fixed");
        } else {
          setToolbarPosition("relative");
        }
      }
    };

    if (scrollableParent) {
      scrollableParent.addEventListener("scroll", handleScroll);
      return () => {
        scrollableParent.removeEventListener("scroll", handleScroll);
      };
    }

    return undefined;
  }, []);

  // Sync value to editor content safely
  useEffect(() => {
    if (editorRef.current) {
      // Only update if the new value is different from current content
      // AND we are not the ones who just triggered this update (to prevent cursor jump)
      // OR if we are not focused (e.g. initial load or external reset)
      if (editorRef.current.innerHTML !== value) {
        if (document.activeElement !== editorRef.current) {
          editorRef.current.innerHTML = value;
          // Update direction on external load
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
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerText;
      const newDir = getDirection(content);
      if (newDir !== direction) {
        setDirection(newDir);
      }
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
      // Update active formats after input
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
    // Trigger input handler to update direction
    handleInput();
  }, [handleInput]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      execCommand("bold");
      // Update formats after a short delay
      setTimeout(updateActiveFormats, 0);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      execCommand("italic");
      // Update formats after a short delay
      setTimeout(updateActiveFormats, 0);
    }
  }, [execCommand, updateActiveFormats]);

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
      className={`p-1.5 rounded transition-colors ${
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

    const formats = [
      { label: direction === 'rtl' ? 'عادي' : 'Normal', cmd: 'formatBlock', value: 'p' },
      { label: direction === 'rtl' ? 'عنوان 1' : 'Heading 1', cmd: 'formatBlock', value: 'h1' },
      { label: direction === 'rtl' ? 'عنوان 2' : 'Heading 2', cmd: 'formatBlock', value: 'h2' },
      { label: direction === 'rtl' ? 'عنوان 3' : 'Heading 3', cmd: 'formatBlock', value: 'h3' },
    ];

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 flex items-center gap-1"
          title={direction === 'rtl' ? 'حجم الخط' : 'Font Size'}
        >
          {direction === 'rtl' ? 'التنسيق' : 'Format'}
          <ChevronDown className="w-3 h-3" />
        </button>
        {isOpen && (
          <div className="absolute top-full mt-1 bg-white dark:bg-gray-800 border border-border rounded shadow-lg z-20 min-w-max">
            {formats.map((format) => (
              <button
                key={format.value}
                type="button"
                onClick={() => {
                  execCommand(format.cmd, format.value);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
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
    <>
      {/* Toolbar - Fixed relative to modal scroll */}
      <div 
        ref={toolbarRef}
        className={`flex flex-wrap items-center gap-1 p-2 border-b border-border bg-gray-50 dark:bg-gray-900/50 transition-all duration-300 z-30 ${
          toolbarPosition === "fixed" ? 'fixed left-0 right-0 rounded-none shadow-lg' : 'relative'
        }`}
        style={{
          top: toolbarPosition === "fixed" ? "0px" : "auto",
        }}
      >
        <FormatDropdown />

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton 
          onClick={() => {
            execCommand("bold");
            setTimeout(updateActiveFormats, 0);
          }} 
          title={direction === 'rtl' ? 'عريض (Ctrl+B)' : 'Bold (Ctrl+B)'}
          isActive={activeFormats.bold}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => {
            execCommand("italic");
            setTimeout(updateActiveFormats, 0);
          }} 
          title={direction === 'rtl' ? 'مائل (Ctrl+I)' : 'Italic (Ctrl+I)'}
          isActive={activeFormats.italic}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton 
          onClick={() => {
            execCommand("justifyLeft");
            setTimeout(updateActiveFormats, 0);
          }} 
          title={direction === 'rtl' ? 'محاذاة لليسار' : 'Align Left'}
          isActive={activeFormats.justifyLeft}
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => {
            execCommand("justifyCenter");
            setTimeout(updateActiveFormats, 0);
          }} 
          title={direction === 'rtl' ? 'توسيط' : 'Center'}
          isActive={activeFormats.justifyCenter}
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => {
            execCommand("justifyRight");
            setTimeout(updateActiveFormats, 0);
          }} 
          title={direction === 'rtl' ? 'محاذاة لليمين' : 'Align Right'}
          isActive={activeFormats.justifyRight}
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton 
          onClick={() => {
            execCommand("insertUnorderedList");
            setTimeout(updateActiveFormats, 0);
          }} 
          title={direction === 'rtl' ? 'قائمة نقطية' : 'Bullet List'}
          isActive={activeFormats.insertUnorderedList}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => {
            execCommand("insertOrderedList");
            setTimeout(updateActiveFormats, 0);
          }} 
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

      {/* Editor Container */}
      <div ref={containerRef} className={`flex flex-col border border-border rounded-lg overflow-hidden bg-background shadow-sm ${toolbarPosition === "fixed" ? "mt-[52px]" : ""} ${className}`}>
        {/* Editor Area */}
        <div className="flex-1 bg-white dark:bg-zinc-950 cursor-text">
          <div
            ref={editorRef}
            contentEditable
            dir={direction}
            onInput={handleInput}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            onMouseUp={updateActiveFormats}
            data-placeholder={placeholder}
            className={`min-h-[400px] p-6 focus:outline-none max-w-none 
              prose prose-sm dark:prose-invert 
              prose-p:my-3 prose-headings:my-4 prose-ul:my-2 prose-ol:my-2
              ${direction === 'rtl' ? 'text-right' : 'text-left'}
              [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground`}
            style={{
              fontFamily: direction === 'rtl' ? 'inherit' : 'Inter, sans-serif'
            }}
          />
        </div>
      </div>
    </>
  );
};

export default RichTextEditor;
