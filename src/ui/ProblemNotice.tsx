/**
 * A notice that floats at the bottom of the screen when something goes wrong.
 * It sits on top of the page instead of in it, so the results you already
 * have stay exactly where they are. `role="alert"` makes screen readers announce it.
 */
export function ProblemNotice({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="fixed inset-x-4 bottom-4 z-20 mx-auto max-w-xl rounded-card border-l-4 border-ember bg-rock px-5 py-4 text-paper shadow-xl shadow-crevice/40"
    >
      {message}
    </div>
  );
}
