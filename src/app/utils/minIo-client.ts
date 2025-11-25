import * as Minio from 'minio';
import config from '../../config';

export const minioClient = new Minio.Client({
    endPoint: config.minio.endPoint as string,
    port: Number(config.minio.port),
    useSSL: config.minio.use_ssl === 'true',
    accessKey: config.minio.accessKey,
    secretKey: config.minio.secretKey,
});
