// application logic

import { Pool } from 'pg';
import { getSchema as fetchSchema } from '../db/postgres.js';
import { postgresRepository } from '../repositories/postgres.repository.js';

function isMissingRequiredConfig(config) {
  return !config || !config.host || !config.user || !config.database;
}

function createPostgresClient(config) {
  return new Pool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    ssl: config.ssl ?? false,
  });
}

async function testAndSetDb(config) {
  if (!config) return { ok: false, error: 'No config provided' };

  if (isMissingRequiredConfig(config)) {
    return { ok: false, error: 'Host, user and database are required' };
  }

  if (config.password !== undefined && typeof config.password !== 'string') {
    return { ok: false, error: 'DB password must be a string' };
  }

  let candidatePool;
  try {
    candidatePool = createPostgresClient(config);
    await candidatePool.query('SELECT 1');
    await postgresRepository.replacePool(candidatePool);
    return { ok: true };
  } catch (err) {
    try {
      if (candidatePool) await candidatePool.end();
    } catch (closeErr) {
      /* ignore */
    }
    return { ok: false, error: err.message };
  }
}

// Public interface
export const postgresService = {
  async connectDemo() {
    const demoCfg = {
      host: process.env.DEMO_DB_HOST,
      port: process.env.DEMO_DB_PORT,
      user: process.env.DEMO_DB_USER,
      password: process.env.DEMO_DB_PASSWORD,
      database: process.env.DEMO_DB_NAME,
      ssl: process.env.DEMO_DB_SSL === 'true' || false,
    };

    if (isMissingRequiredConfig(demoCfg)) {
      return { ok: false, error: 'Demo DB credentials are not configured on the server', status: 400 };
    }

    const result = await testAndSetDb(demoCfg);
    if (result.ok) {
      return { ok: true };
    }

    return { ok: false, error: result.error, status: 500 };
  },
  async connect(config) {
    if (isMissingRequiredConfig(config)) {
      return { ok: false, error: 'Host, user and database are required', status: 400 };
    }

    const result = await testAndSetDb(config);
    if (result.ok) {
      return { ok: true };
    }

    return { ok: false, error: result.error, status: 500 };
  },
  getStatus() {
    return { available: postgresRepository.isAvailable() };
  },
  async getHealth() {
    const pool = postgresRepository.getPool();
    if (!pool || !postgresRepository.isAvailable()) {
      return { ok: false, status: 503, body: { status: 'unavailable', error: 'DB connection not available' } };
    }

    try {
      const result = await pool.query('SELECT NOW()');
      return { ok: true, body: { status: 'ok', time: result.rows[0].now } };
    } catch (err) {
      return { ok: false, status: 500, body: { error: err.message } };
    }
  },
  async getSchema() {
    const pool = postgresRepository.getPool();
    if (!pool || !postgresRepository.isAvailable()) {
      return { ok: false, status: 503, body: { error: 'DB connection not available' } };
    }

    try {
      const schema = await fetchSchema(pool);
      return { ok: true, body: schema };
    } catch (err) {
      return { ok: false, status: 500, body: { error: err.message } };
    }
  },
};
