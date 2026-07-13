export function LandscapeMark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="11.25" stroke="currentColor" opacity=".28" />
      <circle cx="16" cy="16" r="7.25" stroke="currentColor" opacity=".5" />
      <path
        d="M16 6.25a9.75 9.75 0 0 1 9.75 9.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M16 10.25a5.75 5.75 0 0 1 5.75 5.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="m16 16 6.8-6.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <circle cx="16" cy="16" r="2.6" fill="currentColor" />
      <circle cx="24.2" cy="8.1" r="1.75" fill="currentColor" />
    </svg>
  );
}
