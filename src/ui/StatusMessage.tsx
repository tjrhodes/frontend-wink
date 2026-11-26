/**
 * A friendly message in place of results: nothing typed yet, nothing found,
 * or something went wrong. `role="status"` makes screen readers announce it.
 */
import type { ReactNode } from "react";

type StatusMessageProps = { title: string; tone?: "info" | "problem"; children?: ReactNode };

export function StatusMessage({ title, tone = "info", children }: StatusMessageProps) {
  const accent = tone === "problem" ? "border-ember" : "border-lichen";
  return (
    <div role="status" className={`my-10 border-l-4 ${accent} bg-mist px-6 py-5`}>
      <h2 className="text-2xl text-rock">{title}</h2>
      {children && <div className="mt-2 text-mute">{children}</div>}
    </div>
  );
}
