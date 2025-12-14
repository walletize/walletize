import { escapeRegExp } from '@/lib/utils';

interface HighlightedTextProps {
  text: string;
  highlight?: string;
}

export function HighlightedText({ text, highlight }: HighlightedTextProps) {
  if (!highlight?.trim()) {
    return <>{text}</>;
  }

  const trimmedHighlight = highlight.trim();
  const segments = text.split(new RegExp(`(${escapeRegExp(trimmedHighlight)})`, 'i'));

  return (
    <>
      {segments.map((segment, index) =>
        segment.toLowerCase() === trimmedHighlight.toLowerCase() ? (
          <span
            key={index}
            className="rounded bg-amber-200 px-0.5 text-xs font-semibold text-foreground dark:bg-amber-600"
          >
            {segment}
          </span>
        ) : (
          <span key={index}>{segment}</span>
        ),
      )}
    </>
  );
}

