import path from 'path';
import chalk from 'chalk';
import DailyRotateFile from 'winston-daily-rotate-file';
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const consoleFormat = printf(
    ({ level, message, label, timestamp }: { level: string; message: string; label: string; timestamp: Date }) => {
        const date = new Date(timestamp);
        const hour = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        let coloredLevel = level;
        if (level.includes('info')) {
            coloredLevel = chalk.green.bold(level.toUpperCase());
        } else if (level.includes('error')) {
            coloredLevel = chalk.red.bold(level.toUpperCase());
        } else if (level.includes('warn')) {
            coloredLevel = chalk.yellow.bold(level.toUpperCase());
        } else if (level.includes('debug')) {
            coloredLevel = chalk.blue.bold(level.toUpperCase());
        }

        const coloredDate = chalk.gray(`${date.toDateString()} ${hour}:${minutes}:${seconds}`);
        const coloredLabel = chalk.cyan(`[${label}]`);
        const coloredMessage = level.includes('error') ? chalk.red(message) : chalk.white(message);

        return `${coloredDate} ${coloredLabel} ${coloredLevel}: ${coloredMessage}`;
    }
);

const fileFormat = printf(
    ({ level, message, label, timestamp }: { level: string; message: string; label: string; timestamp: Date }) => {
        const date = new Date(timestamp);
        const hour = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${date.toDateString()} ${hour}:${minutes}:${seconds} [${label}] ${level.toUpperCase()}: ${message}`;
    }
);

const logger = createLogger({
    level: 'info',
    format: combine(label({ label: 'MY_SERVER' }), timestamp()),
    transports: [
        new transports.Console({
            format: consoleFormat,
        }),
        new DailyRotateFile({
            filename: path.join(process.cwd(), 'winston', 'success', '%DATE%-success.log'),
            datePattern: 'DD-MM-YYYY-HH',
            maxSize: '20m',
            maxFiles: '1d',
            format: fileFormat,
        }),
    ],
});

const errorLogger = createLogger({
    level: 'error',
    format: combine(label({ label: 'MY_SERVER' }), timestamp()),
    transports: [
        new transports.Console({
            format: consoleFormat,
        }),
        new DailyRotateFile({
            filename: path.join(process.cwd(), 'winston', 'error', '%DATE%-error.log'),
            datePattern: 'DD-MM-YYYY-HH',
            maxSize: '20m',
            maxFiles: '1d',
            format: fileFormat,
        }),
    ],
});

export { errorLogger, logger };
