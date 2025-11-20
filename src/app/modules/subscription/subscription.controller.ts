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

const cancelSubscriptionFromStripe = catchAsync(async (req, res) => {
    const result = await SubscriptionService.cancelSubscriptionFromStripe(req.user.id, req.body.packageId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Subscription cancelled successfully',
        data: result,
    });
});

export const SubscriptionController = {
    createSubscriptionPaymentLink,
    cancelSubscriptionFromStripe,
};
