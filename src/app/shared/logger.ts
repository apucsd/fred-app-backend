import morgan from 'morgan';
import chalk from 'chalk';

//  ============ LOGGER TOKENS ============
morgan.token('status-colored', (req, res) => {
    const status = res.statusCode;
    if (status >= 500) return chalk.red.bold(status);
    if (status >= 400) return chalk.red(status);
    if (status >= 300) return chalk.yellow(status);
    return chalk.green(status);
});

//  ============ LOGGER TOKENS ============
morgan.token('method-colored', (req) => {
    const method = req.method ?? 'UNKNOWN';

    const colors: Record<string, chalk.Chalk> = {
        GET: chalk.cyan,
        POST: chalk.green,
        PUT: chalk.yellow,
        PATCH: chalk.magenta,
        DELETE: chalk.red,
        UNKNOWN: chalk.white,
    };

    const color = colors[method] || chalk.white;
    return color(method);
});

//  ============ LOGGER TOKENS ============
morgan.token('response-time-colored', (req, res) => {
    const start = (req as any)._startAt;
    const end = process.hrtime();
    let ms = 0;

    if (start) {
        const diff = [end[0] - start[0], end[1] - start[1]];
        ms = diff[0] * 1000 + diff[1] / 1e6;
    }

    if (ms > 1000) return chalk.red(`${ms.toFixed(2)}ms`);
    if (ms > 500) return chalk.yellow(`${ms.toFixed(2)}ms`);
    return chalk.green(`${ms.toFixed(2)}ms`);
});

//  ============ LOGGER TOKENS ============
morgan.token('timestamp', () => chalk.blueBright(new Date().toISOString()));

//  ============ LOGGER ============
export const httpLogger = morgan((tokens, req, res) => {
    return [
        chalk.gray('────────────────────────────────────────────────────────────'),
        `${chalk.cyan('🚀')}  ${tokens['method-colored'](req, res)} ${chalk.white(tokens.url(req, res))}`,
        `${chalk.magenta('📦')}  Status: ${tokens['status-colored'](req, res)}`,
        `${chalk.yellow('⏱')}  Time: ${tokens['response-time-colored'](req, res)}`,
        `${chalk.green('🔧')}  Method: ${tokens['method-colored'](req, res)}`,
        `${chalk.blue('📅')}  ${tokens.timestamp(req, res)}`,
        chalk.gray('────────────────────────────────────────────────────────────'),
    ].join('\n');
});
