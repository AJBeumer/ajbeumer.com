"use client";

import React, { useEffect, useState, useRef } from "react";

const BOOT_LINES = [
  { text: "AJB-OS v1.0.0  Copyright 1987-2026 Aart-Jan Beumer", delay: 0 },
  { text: "Memory test: 640K OK", delay: 180 },
  { text: "Initializing filesystem...", delay: 360 },
  { text: "Loading ABOUT.DAT................ OK", delay: 540 },
  { text: "Loading WORK.DAT................. OK", delay: 720 },
  { text: "Loading SKILLS.DAT............... OK", delay: 900 },
  { text: "Loading CONTACT.DAT.............. OK", delay: 1080 },
  { text: "Mounting virtual drive C:\\AJBEUMER\\", delay: 1260 },
  { text: "", delay: 1440 },
  { text: "Welcome. Type HELP to begin.", delay: 1540 },
  { text: "", delay: 1640 },
];

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const doneRef = useRef(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line.text]);
        if (i === BOOT_LINES.length - 1 && !doneRef.current) {
          doneRef.current = true;
          setTimeout(onComplete, 700);
        }
      }, line.delay);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-dos-bg flex flex-col justify-center px-8 py-12 font-mono">
      <div className="max-w-2xl">
        {visibleLines.map((line, i) => (
          <div
            key={i}
            className={`text-sm leading-relaxed ${
              line.startsWith("Welcome")
                ? "text-dos-green font-bold"
                : line === ""
                ? "h-4"
                : "text-dos-text"
            }`}
          >
            {line || "\u00a0"}
          </div>
        ))}
        {visibleLines.length < BOOT_LINES.length && (
          <span className="cursor-blink" />
        )}
      </div>
    </div>
  );
}
