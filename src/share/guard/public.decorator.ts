import { SetMetadata } from '@nestjs/common';

// Token để đánh dấu API là public
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)