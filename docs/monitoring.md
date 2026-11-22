# Client Monitoring & Error Telemetry

Unexpected runtime render errors are caught by `src/components/AppErrorBoundary.tsx`, which renders a safe recovery screen and emits sanitized telemetry without leaking auth tokens or raw request bodies.

## Top 3 Production Metrics to Track
1. **Checkout Conversion & `409 OUT_OF_STOCK` Rate:** Tracks the ratio of `POST /api/orders` attempts that succeed (`201`) versus fail with inventory conflicts (`409`) or server errors (`500`), alerting engineers when stock sync lags behind checkout traffic.
2. **Search API Latency (p95) & Abort Ratio:** Measures `GET /api/products` p95 response time and how frequently requests are aborted by fast typing (`AbortController`), revealing when debouncing or backend indexing needs tuning.
3. **Unhandled JavaScript Exceptions & Error Boundary Triggers:** Captures runtime crashes grouped by route and release version so regressions are caught immediately after deployment.