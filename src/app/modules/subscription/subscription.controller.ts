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

export const SubscriptionController = {
    createSubscriptionPaymentLink,
};
