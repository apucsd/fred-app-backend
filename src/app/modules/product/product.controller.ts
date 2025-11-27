import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { ProductService } from './product.service';
const createProduct = catchAsync(async (req, res) => {
    req.body.userId = req?.user?.id;
    const result = await ProductService.createProductInDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Product created successfully',
        data: result,
    });
});

const updateProduct = catchAsync(async (req, res) => {
    const result = await ProductService.updateProductInDB(req.params.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product updated successfully',
        data: result,
    });
});

const getAllProducts = catchAsync(async (req, res) => {
    const result = await ProductService.getAllProductsFromDB(req.user?.id, req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Products fetched successfully',
        data: result,
    });
});

const getSpecificUserProducts = catchAsync(async (req, res) => {
    const result = await ProductService.getSpecificUserProducts(req.user?.id, req.params.id, req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Products fetched successfully',
        data: result,
    });
});

const getSingleProduct = catchAsync(async (req, res) => {
    const result = await ProductService.getSingleProductFromDB(req.user?.id, req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product fetched successfully',
        data: result,
    });
});

const deleteProduct = catchAsync(async (req, res) => {
    const result = await ProductService.deleteProductFromDB(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product deleted successfully',
        data: result,
    });
});

export const ProductController = {
    createProduct,
    getAllProducts,
    getSpecificUserProducts,
    getSingleProduct,
    deleteProduct,
    updateProduct,
};
