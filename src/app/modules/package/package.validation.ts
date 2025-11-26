import { Currency, PackageInterval, UserRoleEnum } from '@prisma/client';
import z from 'zod';

const packageValidationSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        description: z.string().min(1, 'Description is required'),
        features: z.array(z.string()).min(1, 'At least one feature is required'),
        price: z.number().min(0, 'Price must be a positive number'),
        discountPercent: z
            .number()
            .min(0, 'Discount percent must be a positive number')
            .max(100, 'Discount percent must be less than 100')
            .optional(),
        type: z.nativeEnum(UserRoleEnum),
        interval: z.nativeEnum(PackageInterval),
        currency: z.nativeEnum(Currency).default('usd'),
    }),
});

const updatePackageValidationSchema = z.object({
    body: z
        .object({
            name: z.string().optional(),
            description: z.string().optional(),
            features: z.array(z.string()).optional(),
            type: z.nativeEnum(UserRoleEnum).optional(),
        })
        .partial(),
});

export const packageValidation = {
    packageValidationSchema,
    updatePackageValidationSchema,
};
