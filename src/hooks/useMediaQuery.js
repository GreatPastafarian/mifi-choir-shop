import { useState, useEffect } from 'react';

/**
 * Custom hook for handling media queries.
 * @param {string} query - The media query string to match against.
 * @returns {boolean} - Returns true if the document matches the media query, false otherwise.
 */
const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        media.addListener(listener);
        return () => media.removeListener(listener);
    }, [matches, query]);

    return matches;
};

export default useMediaQuery;
