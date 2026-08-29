CREATE TABLE IF NOT EXISTS call_logs (
    call_id VARCHAR(50) PRIMARY KEY,
    call_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cs_name VARCHAR(100) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    sentiment_score NUMERIC(5, 2) NOT NULL CHECK (sentiment_score >= 0.00 AND sentiment_score <= 100.00)
);

CREATE INDEX IF NOT EXISTS idx_call_logs_timestamp ON call_logs (call_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_call_logs_sentiment ON call_logs (sentiment_score);