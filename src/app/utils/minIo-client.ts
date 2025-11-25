import * as Minio from 'minio';
import config from '../../config';

export const minioClient = new Minio.Client({
    endPoint: config.minio.endPoint as string,
    port: 9000,
    useSSL: false,
    accessKey: config.minio.accessKey,
    secretKey: config.minio.secretKey,
});
