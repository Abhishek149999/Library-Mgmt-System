export default () => ({
  port: (process.env.port, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: (process.env.DATABASE_PORT, 10) || 5432,
  },
});
