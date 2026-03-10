
import { B } from "@/lib/brand";

/**
 * Full-page loading spinner.
 * @param {string} label - Text shown below the spinner (default: "Loading")
 */
export function PageSpinner({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin"
          width="32" height="32" viewBox="0 0 24 24"
          fill="none" stroke={B.orange} strokeWidth="2.5"
        >
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
        <span
          className="font-sans font-extrabold text-[10px] tracking-[3px] uppercase animate-pulse"
          style={{ color: B.smoke }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

/**
 * Full-page error state with retry button.
 * @param {string}   message  - Error message to display
 * @param {function} onRetry  - Called when the retry button is clicked
 */
export function PageError({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-5">
      <div className="text-[56px] mb-4">⚠️</div>
      <h2 className="font-serif font-black text-brand-black text-[24px] tracking-[-0.5px] mb-2">
        Could not load data
      </h2>
      <p className="font-sans text-brand-smoke text-[13px] max-w-[360px] leading-relaxed mb-4">
        {message}
      </p>
      <p className="font-sans text-brand-smoke/60 text-[12px] mb-6">
        Make sure the database is running:{" "}
        <code className="bg-gray-100 px-2 py-1 border border-gray-200 text-[11px]">
          docker compose up -d
        </code>
      </p>
      <button
        onClick={onRetry}
        className="font-sans font-extrabold text-[12px] tracking-[1.5px] uppercase bg-brand-orange text-brand-cream border-2 border-brand-black px-6 py-3 cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
      >
        Retry
      </button>
    </div>
  );
}