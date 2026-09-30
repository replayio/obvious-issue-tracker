// Reached only through the lazy wrapper in ./RichTextEditor — this module is
// a dynamic-import chunk, never part of the initial bundle.
import { useEffect } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { AllSelection, TextSelection } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import { Code as CodeExtension } from "@tiptap/extension-code";
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

// TipTap's toggleList normalizes a whole-doc selection when unlisting, but
// leaves the Ctrl+A AllSelection in place when creating a list. An AllSelection
// reads as "not inside a list" — so the list toggle drops its pressed state
// even though the list was created — and typing would replace the entire
// document. Collapse it to a text selection spanning the first block, mirroring
// TipTap's own createInnerSelectionForWholeDocList.
function settleListSelection(editor: Editor) {
  const { selection, doc } = editor.state;
  if (!(selection instanceof AllSelection)) return;
  const first = doc.firstChild;
  if (!first) return;
  editor.view.dispatch(
    editor.state.tr.setSelection(
      TextSelection.between(doc.resolve(1), doc.resolve(first.nodeSize - 1)),
    ),
  );
}

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
    // Create the editor in the mount effect instead of during render. When this
    // component is lazily mounted right after its chunk downloads, Tiptap's
    // useEditor arms a 1ms destroy timer that can outrun React's effect flush
    // and orphan the render-time instance, crashing getHTML() with a null
    // schema and unmounting the whole app (bug-mun3jox6-810l).
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({ code: false }),
      // Inline code must layer on top of other marks instead of replacing them.
      // TipTap's Code mark declares excludes: "_" (exclude ALL marks), so
      // toggling it wiped bold/italic/underline from the selection.
      CodeExtension.extend({ excludes: "" }),
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
    // Defense in depth: a destroyed editor can still be captured by a queued
    // effect under scheduling pressure; skip instead of throwing.
    if (!editor || editor.isDestroyed) return;
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
      run: () => {
        editor.chain().focus().toggleBulletList().run();
        settleListSelection(editor);
      },
    },
    {
      icon: ListOrdered,
      label: "Numbered list",
      isActive: state.orderedList,
      run: () => {
        editor.chain().focus().toggleOrderedList().run();
        settleListSelection(editor);
      },
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
          // Keep focus (and the selection) in the editor while clicking toolbar
          // buttons: the default mousedown blurs the editor, and the refocus
          // race could leave a list toggle acting on a stale selection (first
          // click on Bullet list after Ctrl+A was a no-op).
          onMouseDown={(e) => e.preventDefault()}
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

