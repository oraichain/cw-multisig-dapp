// https://codepen.io/chris__sev/pen/JjRqOxa

function Loader() {
  return (
    <div className="flex flex-col items-center">
      {/* Blockchain loader animation */}
      <div className="relative w-32 h-32">
        {/* Outer hexagon (blockchain structure) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl rotate-45 animate-pulse-slow"></div>
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-xl rotate-[30deg] animate-pulse-slow"
              style={{ animationDelay: '0.5s' }}
            ></div>
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl rotate-[60deg] animate-pulse-slow"
              style={{ animationDelay: '1s' }}
            ></div>
          </div>
        </div>

        {/* Chain Circle */}
        <div
          className="absolute inset-0 rounded-full border-4 border-dashed border-primary/30 animate-spin"
          style={{ animationDuration: '10s' }}
        ></div>

        {/* Middle blockchain layer */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 rotate-45 animate-pulse"></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-xl bg-gradient-to-r from-secondary/20 to-accent/20 rotate-[30deg] animate-pulse"
          style={{ animationDelay: '0.7s' }}
        ></div>

        {/* Inner blocks */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rotate-45 rounded-lg shadow-lg animate-pulse"
              style={{ animationDuration: '2s' }}
            ></div>
          </div>
        </div>

        {/* Center block with logo */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm flex items-center justify-center rounded-lg rotate-45 border border-white/20 z-10">
          <span className="text-primary text-2xl rotate-[315deg]">⚛️</span>
        </div>

        {/* Orbiting small blocks */}
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-0 w-4 h-4 animate-orbit"
          style={{ animationDuration: '3s' }}
        >
          <div className="w-full h-full bg-primary rounded-sm rotate-45 shadow-md"></div>
        </div>
        <div
          className="absolute top-1/2 right-0 transform translate-x-0 -translate-y-1/2 w-4 h-4 animate-orbit"
          style={{ animationDuration: '4s', animationDelay: '0.5s' }}
        >
          <div className="w-full h-full bg-secondary rounded-sm rotate-45 shadow-md"></div>
        </div>
        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-0 w-4 h-4 animate-orbit"
          style={{ animationDuration: '5s', animationDelay: '1s' }}
        >
          <div className="w-full h-full bg-accent rounded-sm rotate-45 shadow-md"></div>
        </div>
        <div
          className="absolute top-1/2 left-0 transform -translate-x-0 -translate-y-1/2 w-4 h-4 animate-orbit"
          style={{ animationDuration: '3.5s', animationDelay: '1.5s' }}
        >
          <div className="w-full h-full bg-primary rounded-sm rotate-45 shadow-md"></div>
        </div>
      </div>

      <p className="mt-6 text-base-content/60 text-sm font-medium">
        CONNECTING TO BLOCKCHAIN
      </p>

      <div className="mt-3 flex space-x-3">
        <div
          className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"
          style={{ animationDelay: '0.1s' }}
        />
        <div
          className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"
          style={{ animationDelay: '0.3s' }}
        />
        <div
          className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"
          style={{ animationDelay: '0.5s' }}
        />
      </div>
    </div>
  );
}

export default Loader;
