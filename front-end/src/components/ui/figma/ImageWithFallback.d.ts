import type { ImgHTMLAttributes } from 'react';

type UserImageType = 'avatar' | 'banner' | 'property';

export interface UserImageFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  type?: UserImageType;
  fallbackSrc?: string;
  className?: string;
  alt?: string;
}

export function UserImageFallback(props: UserImageFallbackProps): JSX.Element;
