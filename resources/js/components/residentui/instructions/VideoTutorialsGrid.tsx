// /components/residentui/instructions/VideoTutorialsGrid.tsx
import React from 'react';
import { Video, Eye } from 'lucide-react';

interface VideoTutorial {
  title: string;
  duration: string;
  views: string;
}

interface VideoTutorialsGridProps {
  videos: VideoTutorial[];
}

export const VideoTutorialsGrid: React.FC<VideoTutorialsGridProps> = ({ videos }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
      {videos.map((video, idx) => (
        <div key={idx} className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-3 sm:p-4 transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="relative mb-2 sm:mb-3 aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-black/50 p-2 sm:p-3 text-white group-hover:bg-black/70">
                <Video className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </div>
            </div>
            <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 rounded bg-black/70 px-1 sm:px-2 py-0.5 text-[8px] sm:text-xs text-white">
              {video.duration}
            </div>
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white break-words">{video.title}</h3>
          <div className="mt-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="break-words">{video.views} views</span>
          </div>
        </div>
      ))}
    </div>
  );
};