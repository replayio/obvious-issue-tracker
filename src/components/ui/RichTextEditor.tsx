import { lazy, Suspense, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

// The Tiptap/ProseMirror stack is the heaviest dependency group in the app and
// is only needed once the user actually edits rich text, so the implementation
// lives behind a dynamic-import boundary and is not part of the initial
// bundle. Consumers keep importing this module unchanged.
const RichTextEditorImpl = lazy(() =>
  import("./RichTextEditorImpl").then((m) => ({ default: m.RichTextEditor })),
);

type RichTextEditorProps = ComponentProps<typeof RichTextEditorImpl>;

// Roughly matches the real editor's chrome so the one-time async chunk load
// does not cause a visible layout jump.
function EditorFallback({
  className,
  minHeight,
}: {
  className?: string;
  minHeight?: string;
}) {
  return (
    <div
      style={{ minHeight }}
      aria-hidden
      className={cn("rounded-md border border-input bg-muted/30", className)}
    />
  );
}

export function RichTextEditor(props: RichTextEditorProps) {
  const { className, minHeight = "6rem" } = props;
  return (
    <Suspense
      fallback={
        <EditorFallback className={className} minHeight={minHeight} />
      }
    >
      <RichTextEditorImpl {...props} />
    </Suspense>
  );
}
