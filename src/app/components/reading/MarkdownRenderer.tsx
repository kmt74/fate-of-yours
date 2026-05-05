import React from "react";
import { useApp } from "../../context/AppContext";

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold" style={{ color: "#F0E6D3" }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em
          key={i}
          className="italic"
          style={{ color: "rgba(240,230,211,0.6)" }}
        >
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export interface MarkdownRendererProps {
  text: string;
}

export function MarkdownRenderer({ text }: MarkdownRendererProps) {
  const { language } = useApp();
  const HEADING_FONT = language === "VI" ? "'Playfair Display', serif" : "'Cinzel', serif";

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Handle Images: ![caption](url)
    const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imageMatch) {
      const [_, caption, url] = imageMatch;
      elements.push(
        <div key={`img-${i}`} className="my-8 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[rgba(139,92,246,0.3)] to-[rgba(201,168,76,0.3)] rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <img 
              src={url} 
              alt={caption} 
              className="relative rounded-lg w-48 h-auto shadow-2xl border border-white/5"
            />
          </div>
          {caption && (
            <span className="mt-3 text-[0.7rem] uppercase tracking-widest text-white/30 font-medium">
              {caption}
            </span>
          )}
        </div>
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="mt-8 mb-3.5 pb-2.5 text-[1.08rem] font-semibold tracking-[0.05em]"
          style={{
            fontFamily: HEADING_FONT,
            color: "#C9A84C",
            borderBottom: "1px solid rgba(201,168,76,0.18)",
          }}
        >
          {line.slice(3)}
        </h2>
      );
    }
    else if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="mt-6 mb-2.5 text-[0.95rem] font-semibold tracking-[0.06em]"
          style={{
            fontFamily: HEADING_FONT,
            color: "rgba(167,139,250,0.9)",
          }}
        >
          {line.slice(4)}
        </h3>
      );
    }
    else if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={i}
          className="my-4 rounded-r-lg py-3 px-4 pl-5 text-[0.93rem] italic leading-relaxed"
          style={{
            borderLeft: "2px solid rgba(139,92,246,0.5)",
            fontFamily: "'Raleway', sans-serif",
            color: "rgba(167,139,250,0.75)",
            background: "rgba(139,92,246,0.04)",
          }}
        >
          {renderInline(line.slice(2))}
        </blockquote>
      );
    }
    else if (line.startsWith("- ")) {
      const bulletItems: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        bulletItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul
          key={`ul-${i}`}
          className="my-3 flex flex-col gap-2"
          style={{ paddingLeft: 0, listStyle: "none" }}
        >
          {bulletItems.map((item, bi) => (
            <li key={bi} className="flex items-start gap-2.5">
              <span
                className="mt-2 shrink-0 text-[8px]"
                style={{ color: "rgba(201,168,76,0.5)" }}
                aria-hidden="true"
              >
                ◆
              </span>
              <span
                className="text-[0.93rem] leading-7"
                style={{
                  fontFamily: "'Raleway', sans-serif",
                  color: "rgba(240,230,211,0.68)",
                }}
              >
                {renderInline(item)}
              </span>
            </li>
          ))}
        </ul>
      );
      continue;
    }
    else if (line === "---") {
      elements.push(
        <div
          key={i}
          className="my-6 h-px"
          style={{
            background:
              "linear-gradient(to right, rgba(139,92,246,0.3), rgba(201,168,76,0.2), transparent)",
          }}
          role="separator"
          aria-hidden="true"
        />
      );
    }
    else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    }
    else if (line.startsWith("*") && line.endsWith("*")) {
      elements.push(
        <p
          key={i}
          className="my-1 text-[0.85rem] italic leading-relaxed"
          style={{
            fontFamily: "'Raleway', sans-serif",
            color: "rgba(240,230,211,0.4)",
          }}
        >
          {line.slice(1, -1)}
        </p>
      );
    }
    else {
      elements.push(
        <p
          key={i}
          className="mb-1 text-[0.97rem] tracking-[0.01em]"
          style={{
            fontFamily: "'Raleway', sans-serif",
            color: "rgba(240,230,211,0.75)",
            lineHeight: 1.9,
          }}
        >
          {renderInline(line)}
        </p>
      );
    }
    i++;
  }

  return <article id="Markdown-Render">{elements}</article>;
}
