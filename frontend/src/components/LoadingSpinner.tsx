import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center mt-4">
      <Loader2 className="animate-spin h-8 w-8 text-gray-600 dark:text-gray-400" />
    </div>
  );
};

export default LoadingSpinner;
