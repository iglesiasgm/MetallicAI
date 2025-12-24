"use client";
import { useEffect, useState } from "react";

interface Props {
  text: string;
}

export function RecommendationResponse({ text }: Props) {
  const [visible, setVisible] = useState("");

  useEffect(() => {
    setVisible("");
    let i = 0;

    const interval = setInterval(() => {
      setVisible((prev) => prev + text[i]);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 15);

    return () => clearInterval(interval);
  }, [text]);

  if (!text) return null;

  return (
    <div className="mt-6 p-6 bg-gray-100 rounded-xl whitespace-pre-wrap">
      {visible}
    </div>
  );
}
