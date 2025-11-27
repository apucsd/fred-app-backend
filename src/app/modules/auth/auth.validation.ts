import z from 'zod';

const loginUser = z.object({
    body: z.object({
        email: z
            .string({
                required_error: 'Email is required!',
            })
            .email({
                message: 'Invalid email format!',
            }),
        password: z.string({
            required_error: 'Password is required!',
        }),
    }),
});

const registerUser = z.object({
    body: z.object({
        name: z.string({
            required_error: 'Full Name is required!',
        }),
        email: z
            .string({
                required_error: 'Email is required!',
            })
            .email({
                message: 'Invalid email format!',
            }),
        dateOfBirth: z
            .string({
                required_error: 'Date of Birth is required!',
            })
            .datetime(),
        isAgreeWithTerms: z.boolean().refine((val) => val === true, {
            message: 'You must agree to the terms',
        }),
        password: z.string({
            required_error: 'Password is required!',
        }),
    }),
});

const verifyEmailValidationSchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error: 'Email is required',
            })
            .email({
                message: 'Use a valid email format',
            }),
        otp: z
            .string({
                required_error: 'OTP is required',
            })
            .length(4, {
                message: 'OTP must be exactly 4 digits',
            })
            .regex(/^\d{4}$/, {
                message: 'OTP must contain only digits',
            }),
    }),
});

const resendVerificationEmailValidationSchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error: 'Email is required',
            })
            .email({
                message: 'Use a valid email format',
            }),
    }),
});

const changePasswordValidationSchema = z.object({
    body: z.object({
        oldPassword: z.string({
            required_error: 'Current password is required!',
        }),
        newPassword: z
            .string({
                required_error: 'New password is required!',
            })
            .min(6, {
                message: 'Password must be at least 6 characters long',
            }),
    }),
});

const forgetPasswordValidationSchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error: 'Email is required',
            })
            .email({
                message: 'Use a valid email format',
            }),
    }),
});

const resetPasswordValidationSchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error: 'Email is required',
            })
            .email({
                message: 'Use a valid email format',
            }),
        otp: z
            .string({
                required_error: 'Verification OTP is required',
            })
            .length(4, {
                message: 'OTP must be exactly 4 digits',
            })
            .regex(/^\d{4}$/, {
                message: 'OTP must contain only digits',
            }),
        newPassword: z
            .string({
                required_error: 'New password is required!',
            })
            .min(6, {
                message: 'Password must be at least 6 characters long',
            }),
    }),
});

export const authValidation = {
    loginUser,
    registerUser,
    verifyEmailValidationSchema,
    resendVerificationEmailValidationSchema,
    changePasswordValidationSchema,
    forgetPasswordValidationSchema,
    resetPasswordValidationSchema,
};
