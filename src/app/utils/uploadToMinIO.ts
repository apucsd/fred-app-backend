import config from '../../config';
import { minioClient } from './minIo-client';

type TUploadMinIo = {
    file: Express.Multer.File;
    folder?: string;
};

export const uploadToMinIO = async ({ file, folder = 'iamthat' }: TUploadMinIo): Promise<string> => {
    if (!file) {
        throw new Error('File is required');
    }

    const bucketName = config.minio.bucket as string;
    const fileName = `${config.minio.team}/${folder}/${Date.now()}.${file.originalname.split('.').pop()}`;

    try {
        const bucketExists = await minioClient.bucketExists(bucketName);
        if (!bucketExists) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`Created new bucket: ${bucketName}`);
        }

        setPublicBucketPolicy(bucketName).catch((error) => {
            console.warn('Warning: Could not set bucket policy. Files might not be publicly accessible.', error);
        });
        const metaData = {
            'Content-Type': file.mimetype,
            'Content-Disposition': 'inline',
            'Cache-Control': 'public, max-age=31536000',
        };

        await minioClient.putObject(bucketName, fileName, file.buffer, file.size, metaData);
        const endpoint = config.minio.endPoint;
        const port = config.minio.use_ssl === 'true' ? `:${config.minio.port}` : '';
        const protocol = config.minio.use_ssl === 'true' ? 'https' : 'http';

        return `${protocol}://${endpoint}${port}/${bucketName}/${fileName}`;
    } catch (error) {
        console.error('Error in uploadToMinIO:', error);
        throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
    }
};

const setPublicBucketPolicy = async (bucketName: string): Promise<void> => {
    const policy = {
        Version: '2012-10-17',
        Statement: [
            {
                Effect: 'Allow',
                Principal: { AWS: ['*'] },
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
        ],
    };

    try {
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        console.log(`Bucket policy set successfully for ${bucketName}`);
    } catch (error: any) {
        // console.warn(`Warning: Failed to set bucket policy for ${bucketName}:`, error);
    }
};
