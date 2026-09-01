export function originalImgSrcTos128b(imgSrc: string) {
   const parts = imgSrc.split('/');

   const originalIndex = parts.findIndex((p) => p === 'original');

   if (originalIndex === -1) return null;

   parts[originalIndex] = 's128b';

   const transformedSrc = parts.join('/');

   return transformedSrc;
}
