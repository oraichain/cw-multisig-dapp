const icons = {
  success: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5 mr-2 flex-shrink-0"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5 mr-2 flex-shrink-0"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

function LineAlert({
  variant,
  msg,
  link,
  className = '',
}: {
  variant: 'success' | 'error';
  msg: string;
  link?: string;
  className?: string;
}) {
  const alertClassName = [
    'backdrop-blur-sm',
    variant === 'success'
      ? 'bg-success/10 text-success border border-success/20'
      : 'bg-error/10 text-error border border-error/20',
    'shadow-sm rounded-lg',
    className,
  ].join(' ');

  return (
    <div className={alertClassName}>
      <div className="flex items-center w-full p-3">
        {icons[variant]}
        {link ? (
          <a
            className="flex-grow text-left hover:underline transition-colors duration-200"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ wordBreak: 'break-all' }}
          >
            {msg}
          </a>
        ) : (
          <span className="flex-grow text-left">{msg}</span>
        )}
        {link && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 ml-2 flex-shrink-0 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </div>
  );
}

export default LineAlert;
