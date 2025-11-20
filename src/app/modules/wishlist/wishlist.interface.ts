import { Wishlist } from '@prisma/client';

export type IWishlist = Pick<Wishlist, 'userId' | 'productId' | 'createdAt' | 'id'>;
