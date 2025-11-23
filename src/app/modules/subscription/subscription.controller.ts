import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SubscriptionService } from './subscription.service';
import httpStatus from 'http-status';

const createSubscriptionPaymentLink = catchAsync(async (req, res) => {
    const { packageId } = req.body;
    const result = await SubscriptionService.createSubscriptionPaymentLink(req.user.id, packageId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Subscription payment link created successfully',
        data: result,
    });
});
const getMySubscription = catchAsync(async (req, res) => {
    const result = await SubscriptionService.getMySubscriptionFromDB(req.user.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Subscription fetched successfully',
        data: result,
    });
});

const cancelSubscriptionFromStripe = catchAsync(async (req, res) => {
    const result = await SubscriptionService.cancelSubscriptionFromStripe(req.user.id, req.body.packageId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Subscription cancelled successfully',
        data: result,
    });
});

const upgradeSubscription = catchAsync(async (req, res) => {
    const result = await SubscriptionService.upgradeSubscriptionFromStripeBilling(req.user.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Subscription billing portal opened successfully',
        data: result,
    });
});

export const SubscriptionController = {
    createSubscriptionPaymentLink,
    cancelSubscriptionFromStripe,
    upgradeSubscription,
    getMySubscription,
};
