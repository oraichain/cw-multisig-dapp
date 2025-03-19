// https://codepen.io/chris__sev/pen/JjRqOxa

function Loader() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        {/* Outer circle */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>

        {/* Spinner */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>

        {/* Inner circle with logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-primary text-2xl">⚛️</span>
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <div
          className="w-3 h-3 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: '0.1s' }}
        />
        <div
          className="w-3 h-3 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: '0.3s' }}
        />
        <div
          className="w-3 h-3 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: '0.5s' }}
        />
      </div>
    </div>
  );
}

export default Loader;
