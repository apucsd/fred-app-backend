/* eslint-disable no-console */
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import config from '../../config';

const accessKey = config.do_space.access_key;
const bucket = config.do_space.bucket;
const endpoints = config.do_space.endpoints;
const secretKey = config.do_space.secret_key;
interface UploadResponse {
    Location: string;
}

const s3Client = new S3Client({
    region: 'us-east-1',
    endpoint: `${endpoints}`,
    credentials: {
        accessKeyId: `${accessKey}`,
        secretAccessKey: `${secretKey}`,
    },
});

export const uploadToDigitalOceanAWS = async (file: Express.Multer.File): Promise<UploadResponse> => {
    try {
        const command = new PutObjectCommand({
            Bucket: `${bucket}`,
            Key: `${file.originalname}`,
            Body: file.buffer,
            ACL: 'public-read',
            ContentType: file.mimetype,
        });

        await s3Client.send(command);

        const Location = `${endpoints}/${bucket}/${file.originalname}`;

        return { Location };
    } catch (error) {
        console.error(`Error uploading file`, error);
        throw error;
    }
};

export const uploadMultipleFilesToDigitalOceanAWS = async (files: Express.Multer.File[]): Promise<UploadResponse[]> => {
    try {
        const uploadPromises = files.map((file) => uploadToDigitalOceanAWS(file));
        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        console.error(`Error uploading files`, error);
        throw error;
    }
};

export const deleteMultipleFilesFromDigitalOceanAWS = async (fileUrls: string[]): Promise<void> => {
    try {
        const deletePromises = fileUrls.map((fileUrl) => deleteFromDigitalOceanAWS(fileUrl));
        await Promise.all(deletePromises);
    } catch (error) {
        console.error(`Error deleting files`, error);
        throw error;
    }
};

export const deleteFromDigitalOceanAWS = async (fileUrl: string): Promise<void> => {
    try {
        const key = fileUrl.replace(`${endpoints}/${bucket}/`, '');

        const command = new DeleteObjectCommand({
            Bucket: `${bucket}`,
            Key: key,
        });

        await s3Client.send(command);

        console.log(`Successfully deleted file: ${fileUrl}`);
    } catch (error: any) {
        console.error(`Error deleting file: ${fileUrl}`, error);
        throw new Error(`Failed to delete file: ${error?.message}`);
    }
};
