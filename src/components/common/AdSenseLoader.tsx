import { useEffect } from 'react';
import { useAdSenseSettings } from '@/hooks/useAdSenseSettings';

const AdSenseLoader = () => {
    const { data: settings } = useAdSenseSettings();

    useEffect(() => {
        if (settings?.is_enabled && settings?.publisher_id) {
            // Check if script is already present
            if (document.querySelector('script[src*="adsbygoogle.js"]')) {
                return;
            }

            const script = document.createElement('script');
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.publisher_id}`;
            script.async = true;
            script.crossOrigin = "anonymous";
            document.head.appendChild(script);

            return () => {
                // Optional: remove script on unmount (usually not needed for global scripts)
                // document.head.removeChild(script);
            };
        }
    }, [settings]);

    return null;
};

export default AdSenseLoader;
