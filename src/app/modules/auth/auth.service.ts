import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret, SignOptions } from 'jsonwebtoken';
import config from '../../../config';
import AppError from '../../errors/AppError';
import { generateToken } from '../../utils/generateToken';
import { insecurePrisma, prisma } from '../../utils/prisma';
import { verifyToken } from '../../utils/verifyToken';
import { User } from '@prisma/client';
import { Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { forgetPasswordMail, sendOtpViaMail } from '../../shared/emailTemplate';
import { sendEventToUser } from '../../utils/ws-server';
import { generateOTP } from '../../utils/otp';

const loginUserFromDB = async (
    res: Response,
    payload: {
        email: string;
        password: string;
    }
) => {
    const userData = await insecurePrisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
        },
    });

    const isCorrectPassword: boolean = await bcrypt.compare(payload.password, userData.password);

    if (!isCorrectPassword) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Password incorrect');
    }

    if (userData.role !== 'SUPERADMIN' && !userData.isEmailVerified) {
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

        await prisma.user.update({
            where: { email: userData.email },
            data: {
                otp: otp,
                otpExpiry: otpExpiry,
            },
        });

        try {
            await sendOtpViaMail(userData.email, otp);
            sendResponse(res, {
                statusCode: httpStatus.OK,
                message: 'Please check your email for the verification OTP.',
                data: '',
            });
        } catch {
            throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send verification OTP');
        }
    } else {
        const accessToken = await generateToken(
            {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
            },
            config.jwt.access_secret as Secret,
            config.jwt.access_expires_in as SignOptions['expiresIn']
        );

        return {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            accessToken: accessToken,
        };
    }
};

const registerUserIntoDB = async (payload: User) => {
    const hashedPassword: string = await bcrypt.hash(payload.password, 12);

    //  ============= CHECKING IF USER EXISTS =============
    const isUserExistWithTheGmail = await prisma.user.findFirst({
        where: {
            OR: [{ email: payload.email }],
        },
        select: {
            id: true,
            email: true,
        },
    });

    if (isUserExistWithTheGmail?.email === payload.email) {
        throw new AppError(httpStatus.CONFLICT, 'User already exists with the email');
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    //  ============= CREATING USER =============
    const userData: User = {
        ...payload,
        password: hashedPassword,
        otp: otp,
        otpExpiry: otpExpiry,
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
    };

    const newUser = await prisma.user.create({
        data: userData,
    });

    //  ============= SENDING OTP =============
    try {
        await sendOtpViaMail(newUser.email, otp);
    } catch (error) {
        console.error('Failed to send verification OTP:', error);
    }

    //  ============= CREATING ADMIN NOTIFICATION =============
    const adminUser = await prisma.user.findFirst({
        where: {
            role: 'SUPERADMIN',
        },
    });

    //  ============= CREATING ADMIN NOTIFICATION =============
    if (adminUser) {
        const notificationForAdmin = await prisma.notification.create({
            data: {
                message: `New user registered: ${payload.name}`,
                type: 'USER_REGISTRATION',
                recipientId: adminUser.id,
            },
        });
        sendEventToUser(`notification::${adminUser.id}`, notificationForAdmin);
    }
};

const verifyEmail = async (payload: { email: string; otp: string }) => {
    if (!payload.otp || !payload.email) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Email and OTP are required');
    }

    const user = await insecurePrisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
        },
    });

    if (user.status === 'BLOCKED') {
        throw new AppError(httpStatus.FORBIDDEN, 'User account is blocked');
    }

    if (user.isEmailVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Email is already verified');
    }

    if (!user.otp || user.otp !== payload.otp) {
        throw new AppError(httpStatus.FORBIDDEN, 'Invalid OTP');
    }

    if (!user.otpExpiry || new Date() > user.otpExpiry) {
        throw new AppError(httpStatus.BAD_REQUEST, 'OTP has expired');
    }

    await prisma.user.update({
        where: {
            email: user.email,
        },
        data: {
            isEmailVerified: true,
            otp: null,
            otpExpiry: null,
        },
    });

    const accessToken = await generateToken(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        config.jwt.access_secret as Secret,
        config.jwt.access_expires_in as SignOptions['expiresIn']
    );

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken: accessToken,
    };
};

const changePassword = async (user: any, payload: any) => {
    const userData = await insecurePrisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: 'ACTIVE',
        },
    });

    const isCorrectPassword: boolean = await bcrypt.compare(payload.oldPassword, userData.password);

    if (!isCorrectPassword) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Current password is incorrect');
    }

    const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);

    await prisma.user.update({
        where: {
            id: userData.id,
        },
        data: {
            password: hashedPassword,
        },
    });

    return {
        message: 'Password changed successfully!',
    };
};

const resendUserVerificationEmail = async (email: string) => {
    const user = await insecurePrisma.user.findUniqueOrThrow({
        where: { email: email },
    });

    if (user.status === 'BLOCKED') {
        throw new AppError(httpStatus.FORBIDDEN, 'User account is blocked');
    }

    if (user.isEmailVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Email is already verified');
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    await prisma.user.update({
        where: { email: email },
        data: {
            otp: otp,
            otpExpiry: otpExpiry,
        },
    });

    try {
        await sendOtpViaMail(email, otp);
    } catch {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send verification OTP');
    }

    return { message: 'Verification OTP sent successfully. Please check your inbox.' };
};

const forgetPassword = async (email: string) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email,
        },
        select: {
            status: true,
            id: true,
            name: true,
            role: true,
        },
    });

    if (userData.status === 'BLOCKED') {
        throw new AppError(httpStatus.BAD_REQUEST, 'User account is blocked');
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.user.update({
        where: { email },
        data: {
            otp: otp,
            otpExpiry: otpExpiry,
        },
    });

    try {
        await forgetPasswordMail(email, otp);
    } catch (error) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send password reset OTP');
    }

    return { message: 'Password reset OTP sent successfully. Please check your inbox.' };
};

const verifyPasswordResetOtp = async (payload: { email: string; otp: string }) => {
    if (!payload.email || !payload.otp) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Email and OTP are required');
    }

    const userData = await insecurePrisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
        },
    });

    if (userData.status === 'BLOCKED') {
        throw new AppError(httpStatus.FORBIDDEN, 'User account is blocked');
    }

    if (!userData.otp || userData.otp !== payload.otp) {
        throw new AppError(httpStatus.FORBIDDEN, 'Invalid OTP');
    }

    if (!userData.otpExpiry || new Date() > userData.otpExpiry) {
        throw new AppError(httpStatus.BAD_REQUEST, 'OTP has expired');
    }
    const resetToken = generateToken(
        {
            id: userData.id,
            email: userData.email,
            purpose: 'PASSWORD_RESET',
        },
        config.jwt.access_secret as Secret,
        '5m' as SignOptions['expiresIn']
    );

    await prisma.user.update({
        where: {
            email: payload.email,
        },
        data: {
            otp: null,
            otpExpiry: null,
        },
    });

    return {
        message: 'OTP verified successfully. You can now reset your password.',
        resetToken: resetToken,
    };
};

const resetPassword = async (payload: { resetToken: string; newPassword: string }) => {
    if (!payload.resetToken || !payload.newPassword) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Reset token and new password are required');
    }

    let decodedToken: any;
    try {
        decodedToken = verifyToken(payload.resetToken, config.jwt.access_secret as Secret);
    } catch (error) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired reset token');
    }

    if (decodedToken.purpose !== 'PASSWORD_RESET') {
        throw new AppError(httpStatus.FORBIDDEN, 'Invalid reset token');
    }

    const userData = await insecurePrisma.user.findUniqueOrThrow({
        where: {
            email: decodedToken.email,
        },
    });

    if (userData.status === 'BLOCKED') {
        throw new AppError(httpStatus.FORBIDDEN, 'User account is blocked');
    }

    const newHashedPassword = await bcrypt.hash(payload.newPassword, 12);

    const result = await prisma.user.update({
        where: {
            email: decodedToken.email,
        },
        data: {
            password: newHashedPassword,
        },
    });

    return result;
};

export const AuthServices = {
    loginUserFromDB,
    registerUserIntoDB,
    verifyEmail,
    changePassword,
    resendUserVerificationEmail,
    forgetPassword,
    verifyPasswordResetOtp,
    resetPassword,
};
