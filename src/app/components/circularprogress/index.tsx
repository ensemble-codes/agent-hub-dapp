const CircularProgress = ({
  progress = 25,
}: {
  progress?: number;
}) => {
  const circumference = 2 * Math.PI * 14;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-8 h-8">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
        <circle
          cx="16"
          cy="16"
          r="14"
          stroke="#00D64F33"
          strokeWidth="3"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="16"
          cy="16"
          r="14"
          stroke="#00D64F"
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
    </div>
  );
};

export default CircularProgress;
