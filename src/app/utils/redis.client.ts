import { createClient } from 'redis';
import config from '../../config';

let redisClient: ReturnType<typeof createClient> | null = null;

const createRedisOptions = () => {
  const { host, port, password } = config.redis;

  if (host && host.startsWith('redis://')) {
    return { url: host };
  }

  if (host) {
    return {
      url: `redis://${host}:${port || 6379}`,
      ...(password && { password }),
    };
  }

  return {
    socket: {
      host: '127.0.0.1',
      port: port ? parseInt(port, 10) : 6379,
    },
    ...(password && { password }),
  };
};

export const initRedis = async () => {
  if (redisClient) return redisClient;

  const options = createRedisOptions();
  const client = createClient(options);

  client.on('error', (err) => console.error('Redis Error:', err.message));

  await client.connect();
  console.log('Redis connected ✔');

  redisClient = client;
  return client;
};

export const getRedisClient = async () =>
  redisClient ?? initRedis();

export const redisPromise = initRedis();

export default redisPromise;
