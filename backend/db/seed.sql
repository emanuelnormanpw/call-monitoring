INSERT INTO call_logs (call_id, call_timestamp, cs_name, customer_name, sentiment_score)
VALUES 
    ('CALL-2026-001', NOW() - INTERVAL '1 hour',   'Andi Pratama', 'Budi Santoso',   85.50),
    ('CALL-2026-002', NOW() - INTERVAL '2 days',   'Siti Rahma',   'Dewi Lestari',   45.00),
    ('CALL-2026-003', NOW() - INTERVAL '5 days',   'Andi Pratama', 'Eko Prasetyo',  69.90),
    ('CALL-2026-004', NOW() - INTERVAL '15 days',  'Rina Wijaya',  'Fajar Nugraha',  70.00),
    ('CALL-2026-005', NOW() - INTERVAL '1 month',  'Siti Rahma',   'Gita Gutawa',    92.30),
    ('CALL-2026-006', NOW() - INTERVAL '2 months', 'Andi Pratama', 'Hendra Setiawan', 30.25),
    ('CALL-2026-007', NOW() - INTERVAL '4 months', 'Rina Wijaya',  'Irfan Bachdim',  88.00);