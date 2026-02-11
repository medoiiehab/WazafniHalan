import { useRef, useCallback, useState, useEffect, useMemo } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  toolbarContainerId?: string; // If provided, toolbar renders into this external element
}

// Auto-detect direction based on content --Updated to remove HTML tags and entities
const getDirection = (text: string): "rtl" | "ltr" => {
  if (!text) return "ltr";

  // Remove ALL HTML tags and entities
  const plainText = text
    .replace(/<[^>]+>/g, '')  // Remove HTML tags
    .replace(/&[a-z]+;/g, '') // Remove HTML entities (&nbsp;, &lt;, etc.)
    .trim();

  if (plainText.length === 0) return "ltr";

  const arabicPattern = /[\u0600-\u06FF]/;
  // Check the first non-whitespace characters
  return arabicPattern.test(plainText.slice(0, 20)) ? "rtl" : "ltr";
};

const RichTextEditor = ({ value, onChange, placeholder, className = "", toolbarContainerId }: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);
  const [direction, setDirection] = useState<"rtl" | "ltr">("ltr");
  const [isMounted, setIsMounted] = useState(false);

  // Initialize direction on mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Detect direction when value changes
  useEffect(() => {
    if (value) {
      const plainText = value.replace(/<[^>]+>/g, "");
      const newDir = getDirection(plainText);
      if (newDir !== direction) {
        setDirection(newDir);
      }
    }
  }, [value, direction]);

  const handleChange = useCallback(
    (content: string) => {
      onChange(content);
      if (content) {
        const plainText = content.replace(/<[^>]+>/g, "");
        const newDir = getDirection(plainText);
        if (newDir !== direction) {
          setDirection(newDir);
        }
      }
    },
    [onChange, direction]
  );

  // Quill toolbar options
  const toolbarOptions = [
    // Text formatting
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],

    // Lists
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],

    // Alignment
    [{ align: [] }],

    // Link and image
    ["link"],

    // Color and background
    [{ color: [] }, { background: [] }],

    // Undo/Redo
    ["undo", "redo"],

    // Clear formatting
    ["clean"],
  ];

  // Quill modules configuration — use external toolbar container if provided
  const modules = useMemo(() => ({
    toolbar: toolbarContainerId
      ? { container: `#${toolbarContainerId}` }
      : toolbarOptions,
  }), [toolbarContainerId]);

  // Quill formats configuration
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "list",
    "indent",
    "align",
    "link",
    "color",
    "background",
  ];

  if (!isMounted) {
    return (
      <div className={`flex items-center justify-center rounded-lg border border-border w-full min-h-[400px] ${className}`}>
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div
      dir={direction}
      className={`flex flex-col w-full rounded-lg border border-border overflow-visible bg-background quill-editor-wrapper ${className}`}
    >
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        theme="snow"
        placeholder={placeholder || "Article content..."}
      />
      <style>{`
        .ql-toolbar {
          direction: ltr !important;
          text-align: left !important;
        }
        .ql-picker-label {
          text-align: left !important;
        }
        .ql-formats {
          margin-right: 15px !important;
          margin-left: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
