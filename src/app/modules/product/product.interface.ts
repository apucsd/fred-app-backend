import { ProductStatus } from '@prisma/client';

export interface IProduct {
    title: string;
    description: string;
    price: number;
    images: string[];
    status: ProductStatus;
    categoryId: string;
    userId: string;
}
