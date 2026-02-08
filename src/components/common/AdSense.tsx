import { useEffect, useRef } from 'react';
import { useAdUnitByPlacement, useAdSenseSettings } from '@/hooks/useAdSenseSettings';
const PUB_ID = 'ca-pub-3688967210289296';

interface AdSenseProps {
  size?: 'banner' | 'rectangle' | 'leaderboard' | 'large-rectangle' | 'inline';
  placement?: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AdSense = ({ size = 'rectangle', placement, className = '' }: AdSenseProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);

  const { data: settings } = useAdSenseSettings();
  const effectivePlacement = placement || size;
  const { data: adUnit } = useAdUnitByPlacement(effectivePlacement);

  const sizes = {
    banner: 'h-[60px] w-full max-w-[468px]',
    rectangle: 'h-[250px] w-full max-w-[300px]',
    leaderboard: 'h-[90px] w-full max-w-[728px]',
    'large-rectangle': 'h-[280px] w-full max-w-[336px]',
    inline: 'h-[100px] w-full',
  };

  useEffect(() => {
    if (adUnit?.slot_id && adRef.current && !isAdLoaded.current) {
      try {
        // Push the ad
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isAdLoaded.current = true;
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [adUnit]);

  // If no ad unit configured
  if (!adUnit?.slot_id) {
    // Don't show anything - make it invisible
    return null;
  }

  return (
    <div ref={adRef} className={`adsense-container ${sizes[size]} mx-auto overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client={PUB_ID}
        data-ad-slot={adUnit.slot_id}
        data-ad-format={adUnit.ad_format || 'auto'}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSense;
