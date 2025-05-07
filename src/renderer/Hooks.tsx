import {isEmpty} from 'lodash';
import {useEffect, useState} from 'react';

import {convertBlobToDataUrl} from '../../../src/renderer/src/App/Utils/UtilFunctions';

export function useCacheImage(id: string, url: string): string {
  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    if (isEmpty(url)) return;

    const fetchAndStoreImage = async () => {
      try {
        const response = await fetch(url);
        const data = await response.blob();
        const imageDataUrl = await convertBlobToDataUrl(data);
        localStorage.setItem(id, imageDataUrl);
        setImageSrc(imageDataUrl);
      } catch (error) {
        console.error('Error fetching and storing image:', error);
      }
    };

    const cachedImage = localStorage.getItem(id);
    if (cachedImage) {
      setImageSrc(cachedImage);
    } else {
      fetchAndStoreImage();
    }
  }, [id, url]);

  return imageSrc;
}
