const app = require('./app');
const db = require('./database/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Test and initialize database connection
  await db.testConnection();

  const server = app.listen(PORT, () => {
    console.log(`🚀 [AlexDesk AI] Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📊 Leads API: http://localhost:${PORT}/api/leads`);
  });

  const handleShutdown = () => {
    console.log('\n🛑 Gracefully shutting down AlexDesk AI server...');
    server.close(() => {
      console.log('Server closed. Goodbye!');
      process.exit(0);
    });
  };

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
}

startServer();
