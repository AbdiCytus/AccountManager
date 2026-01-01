// components/dashboard/PaginationControl.tsx
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControl({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 transition-colors">
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      <span className="text-sm font-medium text-gray-600 dark:text-gray-300 px-2">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 transition-colors">
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
