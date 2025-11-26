import { Currency, PackageInterval, PackageStatus, UserRoleEnum } from '@prisma/client';

export interface IPackage {
    id: string;
    name: string;
    description: string;
    features: string[];
    price: number;
    discountPercent: number;
    productLimit: number;
    eventLimit: number;
    type: UserRoleEnum;
    interval: PackageInterval;
    currency: Currency;
    stripeProductId: string;
    stripePriceId: string;
    status: PackageStatus;
}
