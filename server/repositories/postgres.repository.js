// data access code
// Data repository for managing Postgres connection state

const dbState = {
  pool: null,
  available: false,
};

export const postgresRepository = {
  getPool() {
    return dbState.pool;
  },
  isAvailable() {
    return dbState.available;
  },
  async replacePool(newPool) {
    if (dbState.pool && dbState.pool !== newPool) {
      try {
        await dbState.pool.end();
      } catch (err) {
        /* ignore */
      }
    }

    dbState.pool = newPool;
    dbState.available = true;
  },
};
