/**
 * requestLogger — global middleware applied to EVERY request.
 * Logs: [METHOD] [PATH] [STATUS] [RESPONSE-TIME ms]
 *
 * Uses res.on('finish') so the status code is the *final* one, after the
 * route handler has run. Logging inline would always print 200.
 */
const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const time = new Date().toISOString().slice(11, 19);
    console.log(
      `[${time}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`
    );
  });

  next();
};

module.exports = requestLogger;
