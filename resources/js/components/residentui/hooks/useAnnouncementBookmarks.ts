// announcement-show/hooks/useAnnouncementBookmarks.ts
import { useState, useEffect } from 'react';

interface UseAnnouncementBookmarksProps {
    announcementId: number;
}

export const useAnnouncementBookmarks = ({ announcementId }: UseAnnouncementBookmarksProps) => {
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        const bookmarks = JSON.parse(localStorage.getItem('announcement_bookmarks') || '[]');
        setIsBookmarked(bookmarks.includes(announcementId));
    }, [announcementId]);

    const handleBookmark = () => {
        const bookmarks = JSON.parse(localStorage.getItem('announcement_bookmarks') || '[]');

        if (isBookmarked) {
            const newBookmarks = bookmarks.filter((id: number) => id !== announcementId);
            localStorage.setItem('announcement_bookmarks', JSON.stringify(newBookmarks));
            setIsBookmarked(false);
        } else {
            bookmarks.push(announcementId);
            localStorage.setItem('announcement_bookmarks', JSON.stringify(bookmarks));
            setIsBookmarked(true);
        }
    };

    return {
        isBookmarked,
        handleBookmark
    };
};