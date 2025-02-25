"use client";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  color?: "primary" | "white";
}

const Loader = ({ size = "md", color = "primary" }: LoaderProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10",
    "2xl": "w-12 h-12" 
  };

  const borderColorClasses = {
    primary: "border-primary",
    white: "border-white"
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <div className={`w-full h-full rounded-full border-2 ${borderColorClasses[color]} border-t-transparent`} />
    </div>
  );
};

export default Loader; 