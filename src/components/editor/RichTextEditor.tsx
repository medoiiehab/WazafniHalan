import { useRef, useCallback, useState, useEffect } from "react";
import { Bold, Italic, List, ListOrdered, Link, Heading2, Heading3, Undo, Redo, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, className = "" }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<"rtl" | "ltr">("rtl");
  const isInternalUpdate = useRef(false);

  // Auto-detect direction based on content
  const getDirection = (text: string) => {
    if (!text) return "rtl";
    const arabicPattern = /[\u0600-\u06FF]/;
    // Check key characters to determine direction
    // If the first few characters contain Arabic, it's RTL.
    return arabicPattern.test(text.slice(0, 20)) ? "rtl" : "ltr";
  };

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
      // Reset after a short delay or just rely on the fact that the next prop update 
      // will be ignored by the useEffect because activeElement is focused.
    }
  }, [onChange, direction]);

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

  const ToolbarButton = ({
    onClick,
    children,
    title
  }: {
    onClick: () => void;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
    >
      {children}
    </button>
  );

  return (
    <div className={`flex flex-col border border-border rounded-lg overflow-hidden bg-background shadow-sm ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
        <ToolbarButton onClick={() => execCommand("bold")} title="عريض (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("italic")} title="مائل (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton onClick={() => execCommand("formatBlock", "h2")} title="عنوان رئيسي">
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("formatBlock", "h3")} title="عنوان فرعي">
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton onClick={() => execCommand("justifyLeft")} title="محاذاة لليسار">
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("justifyCenter")} title="توسيط">
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("justifyRight")} title="محاذاة لليمين">
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton onClick={() => execCommand("insertUnorderedList")} title="قائمة نقطية">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("insertOrderedList")} title="قائمة مرقمة">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton onClick={handleLink} title="إضافة رابط">
          <Link className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton onClick={() => execCommand("undo")} title="تراجع">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("redo")} title="إعادة">
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-white dark:bg-zinc-950 cursor-text">
        <div
          ref={editorRef}
          contentEditable
          dir={direction}
          onInput={handleInput}
          onPaste={handlePaste}
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
  );
};

export default RichTextEditor;
