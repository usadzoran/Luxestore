import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';

interface Ad {
  id: string;
  placement: string;
  content: string;
  active: number;
}

interface AdPlacementProps {
  placement: string;
}

export const AdPlacement: React.FC<AdPlacementProps> = ({ placement }) => {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    if (!placement) return;
    
    const adsRef = ref(db, 'ads');
    
    const unsubscribe = onValue(adsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const adList = Object.keys(data)
          .map(key => ({ ...data[key], id: key }))
          .filter(ad => ad.placement === placement && ad.active === 1);
        setAds(adList);
      } else {
        setAds([]);
      }
    }, (error) => {
      console.error("Failed to fetch ads", error);
    });

    return () => unsubscribe();
  }, [placement]);

  if (ads.length === 0) return null;

  return (
    <div className="my-8 w-full overflow-hidden rounded-xl">
      {ads.map(ad => (
        <div 
          key={ad.id} 
          dangerouslySetInnerHTML={{ __html: ad.content }} 
          className="ad-container"
        />
      ))}
    </div>
  );
};
