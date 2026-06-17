import { useEffect } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Code,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  Underline as UnderlineIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onBlur?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  autoFocus?: boolean;
  minHeight?: string;
}

const PROSE_CLASS = cn(
  "prose-editor max-w-none text-sm leading-relaxed text-foreground",
  "focus:outline-none",
);

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder = "Add a description…",
  editable = true,
  className,
  autoFocus = false,
  minHeight = "6rem",
}: RichTextEditorProps) {
  const editor = useEditor({
    editable,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    autofocus: autoFocus ? "end" : false,
    editorProps: {
      attributes: { class: cn(PROSE_CLASS, className) },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    onBlur: ({ editor: e }) => onBlur?.(e.getHTML()),
  });

  // Reflect external content changes (e.g. switching issues) into the editor
  // without clobbering in-progress local edits.
  useEffect(() => {
    if (!editor) return;
    const incoming = value || "";
    if (incoming !== editor.getHTML()) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  if (!editor) return null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className={cn(
          "rounded-md",
          editable &&
            "border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring",
        )}
      />
    </div>
  );
}

interface ToolbarButton {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  run: () => void;
}

function EditorToolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
    }),
  });

  const buttons: ToolbarButton[] = [
    {
      icon: Bold,
      label: "Bold",
      isActive: state.bold,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: Italic,
      label: "Italic",
      isActive: state.italic,
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: UnderlineIcon,
      label: "Underline",
      isActive: state.underline,
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      icon: Strikethrough,
      label: "Strikethrough",
      isActive: state.strike,
      run: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      icon: Code,
      label: "Inline code",
      isActive: state.code,
      run: () => editor.chain().focus().toggleCode().run(),
    },
    {
      icon: List,
      label: "Bullet list",
      isActive: state.bulletList,
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: ListOrdered,
      label: "Numbered list",
      isActive: state.orderedList,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-md border border-border bg-muted/40 p-1">
      {buttons.map(({ icon: Icon, label, isActive, run }) => (
        <button
          key={label}
          type="button"
          title={label}
          aria-label={label}
          aria-pressed={isActive}
          onClick={run}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isActive
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

