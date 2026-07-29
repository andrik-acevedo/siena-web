interface CardDeckIconProps {
  className?: string;
  white?: boolean;
}

export function CardDeckIcon({ className = "h-6 w-6", white = true }: CardDeckIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={{ color: white ? 'white' : 'currentColor' }}
    >
      <path d="M21.47 4.35l.708-.708a1 1 0 00-.708-1.707H8.35l-.707.707a1 1 0 001.414 1.414l-.707.707a1 1 0 001.414 1.414l8.486-8.486a1 1 0 00-.707-1.707H9.657l-.707.707a1 1 0 001.414 1.414l-.707.707a1 1 0 001.414 1.414l8.485-8.485z" />
      <path fillRule="evenodd" d="M7 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm0 6a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm0 6a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  );
}

export default CardDeckIcon;