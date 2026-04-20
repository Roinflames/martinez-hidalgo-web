CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'PENDING', -- PENDING, CONTACTED, RESOLVED
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Para almacenar las conversaciones del chatbot si queremos persistencia básica
CREATE TABLE IF NOT EXISTS chatbot_interactions (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_query TEXT,
  bot_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
