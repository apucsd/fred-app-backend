import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { ProductService } from './product.service';
const createProduct = catchAsync(async (req, res) => {
    req.body.userId = req?.user?.id;
    const result = await ProductService.createProductInDB(req.body, req.files as Express.Multer.File[]);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Product created successfully',
        data: result,
    });
});

const getAllProducts = catchAsync(async (req, res) => {
    const result = await ProductService.getAllProductsFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Products fetched successfully',
        data: result,
    });
});

const getSingleProduct = catchAsync(async (req, res) => {
    const result = await ProductService.getSingleProductFromDB(req.params.id);
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
    getSingleProduct,
    deleteProduct,
};
