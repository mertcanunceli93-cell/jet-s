type LogLevel = 'info' | 'warn' | 'error';

type LogPayload = Record<string, unknown>;

function write(level: LogLevel, event: string, payload: LogPayload = {}) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...payload,
  });
  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(line);
    return;
  }
  // eslint-disable-next-line no-console
  console.log(line);
}

export const logger = {
  info: (event: string, payload?: LogPayload) => write('info', event, payload),
  warn: (event: string, payload?: LogPayload) => write('warn', event, payload),
  error: (event: string, payload?: LogPayload) => write('error', event, payload),
};
