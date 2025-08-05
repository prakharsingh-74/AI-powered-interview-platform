import React from 'react';

const SkeletonLoader = ({ type = 'text', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return [...Array(count)].map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gray-300 rounded animate-pulse mb-2 w-full"
          />
        ));
      case 'card':
        return [...Array(count)].map((_, i) => (
          <div
            key={i}
            className="p-4 border rounded-md shadow-sm animate-pulse bg-white mb-4 space-y-3"
          >
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="h-32 bg-gray-300 rounded" />
          </div>
        ));
      case 'list':
        return [...Array(count)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 mb-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4" />
              <div className="h-4 bg-gray-300 rounded w-1/2" />
            </div>
          </div>
        ));
      default:
        return null;
    }
  };

  return <div>{renderSkeleton()}</div>;
};

export default SkeletonLoader;
