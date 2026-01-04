import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { packageServices } from './package.service';
import httpStatus from 'http-status';

const createPackage = catchAsync(async (req, res) => {
    const result = await packageServices.createPackageInToDB(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'Package created successfully',
        data: result,
    });
});

const getAllPackages = catchAsync(async (req, res) => {
    const result = await packageServices.getAllPackagesFromDB(req?.user?.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Packages retrieved successfully',
        data: result,
    });
});

const getAllPackagesForAdmin = catchAsync(async (req, res) => {
    const result = await packageServices.getAdminAllPackagesFromDB(req.query as Record<string, string>);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Packages retrieved successfully',
        data: result,
    });
});

const getPackageById = catchAsync(async (req, res) => {
    const result = await packageServices.getPackageByIdFromDB(req.params.id, req.user?.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Package retrieved successfully',
        data: result,
    });
});

const updatePackage = catchAsync(async (req, res) => {
    const result = await packageServices.updatePackageInToDB(req.params.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Package updated successfully',
        data: result,
    });
});

const deletePackage = catchAsync(async (req, res) => {
    const result = await packageServices.deletePackageInToDB(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Package deleted successfully',
        data: result,
    });
});

export const packageControllers = {
    createPackage,
    getAllPackages,
    getAllPackagesForAdmin,
    getPackageById,
    updatePackage,
    deletePackage,
};
