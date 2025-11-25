import config from '../../config';
import { minioClient } from './minIo-client';

type TUploadMinIo = {
    file: Express.Multer.File;
    folder?: string;
};

type TUploadManyMinIo = {
    files: Express.Multer.File[];
    folder?: string;
};

//========================= UPLOAD SINGLE ==========================
export const uploadToMinIO = async ({ file, folder = 'iamthat' }: TUploadMinIo): Promise<string> => {
    if (!file) {
        throw new Error('File is required');
    }

    const [result] = await uploadManyToMinIO({ files: [file], folder });
    return result;
};

//========================= UPLOAD MULTIPLE ==========================
export const uploadManyToMinIO = async ({ files, folder = 'iamthat' }: TUploadManyMinIo): Promise<string[]> => {
    if (!files || !files.length) {
        throw new Error('At least one file is required');
    }

    const bucketName = config.minio.bucket as string;
    const uploadPromises = files.map((file) => {
        const fileName = `${config.minio.team}/${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${file.originalname.split('.').pop()}`;

        const metaData = {
            'Content-Type': file.mimetype,
            'Content-Disposition': 'inline',
            'Cache-Control': 'public, max-age=31536000',
        };

        return { fileName, file, metaData };
    });

    try {
        const bucketExists = await minioClient.bucketExists(bucketName);
        if (!bucketExists) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`Created new bucket: ${bucketName}`);
        }

        setPublicBucketPolicy(bucketName).catch((error) => {
            console.warn('Warning: Could not set bucket policy. Files might not be publicly accessible.', error);
        });

        const uploadResults = await Promise.all(
            uploadPromises.map(async ({ fileName, file, metaData }) => {
                await minioClient.putObject(bucketName, fileName, file.buffer, file.size, metaData);
                const endpoint = config.minio.endPoint;
                const port = config.minio.use_ssl === 'true' ? `:${config.minio.port}` : '';
                const protocol = config.minio.use_ssl === 'true' ? 'https' : 'http';
                return `${protocol}://${endpoint}${port}/${bucketName}/${fileName}`;
            })
        );

        return uploadResults;
    } catch (error) {
        console.error('Error in uploadManyToMinIO:', error);
        throw new Error(`Failed to upload files: ${error instanceof Error ? error.message : String(error)}`);
    }
};

const extractMinioPath = (url: string, bucket: string): string => {
    try {
        // Find: bucket/
        const bucketIndex = url.indexOf(`${bucket}/`);
        if (bucketIndex === -1) {
            console.warn('Bucket name not found in URL, returning raw path');
            return url.replace(/^https?:\/\/[^\/]+\//, ''); // fallback
        }

        // Return everything after bucket/
        return url.substring(bucketIndex + bucket.length + 1);
    } catch (err) {
        console.error('extractMinioPath error:', err);
        return url;
    }
};

export const deleteToMinIO = async (fullUrl: string) => {
    try {
        const bucketName = config.minio.bucket as string;

        // Extract object key from URL
        const objectKey = extractMinioPath(fullUrl, bucketName);

        console.log('Bucket:', bucketName);
        console.log('Full URL:', fullUrl);
        console.log('Object Key:', objectKey);

        // 1. Check before delete
        try {
            await minioClient.statObject(bucketName, objectKey);
            console.log('File exists before delete');
        } catch {
            console.warn('File does NOT exist before delete (may already be deleted)');
        }

        // 2. Delete the file
        await minioClient.removeObject(bucketName, objectKey);
        console.log('MinIO delete requested');

        // 3. Check after delete (important!)
        try {
            await minioClient.statObject(bucketName, objectKey);
            console.error('❌ Delete FAILED: File still exists!');
            return { success: false, message: 'Delete failed' };
        } catch {
            console.log('✔ Delete SUCCESS: File removed');
            return { success: true, message: 'File deleted' };
        }
    } catch (error: any) {
        console.error('Error in deleteToMinIO:', error);
        throw new Error(`Failed to delete file: ${error.message}`);
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
