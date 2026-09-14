type LocationPinIconProps = {
  className?: string;
};

export function LocationPinIcon({ className = "h-4 w-4" }: LocationPinIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 64 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="32" cy="75" rx="13" ry="3" fill="#AFAFAF" />
      <path d="M32 2C15.43 2 2 15.43 2 32c0 8.28 3.36 15.78 8.79 21.21L32 74l21.21-20.79A29.9 29.9 0 0 0 62 32C62 15.43 48.57 2 32 2Z" fill="#FF1010" />
      <circle cx="32" cy="31" r="11" fill="white" />
    </svg>
  );
}