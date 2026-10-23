import mongoose from "mongoose";
import { configureDatabaseDns, databaseOptions, databaseFailure, DATABASE_NAME, COLLECTIONS } from "../src/config/database.js";

// Read-only diagnostic: no provisioning, registrations, migrations, or test records.
try {
  configureDatabaseDns();
  await mongoose.connect(process.env.MONGODB_URI, databaseOptions(process.env.MONGODB_URI));
  await mongoose.connection.db.command({ ping: 1 });
  const names = new Set((await mongoose.connection.db.listCollections({}, { nameOnly: true }).toArray()).map(c => c.name));
  console.log(JSON.stringify({ connected: true, database: DATABASE_NAME, collections: Object.fromEntries(Object.values(COLLECTIONS).map(name => [name, names.has(name) ? "present" : "not provisioned"])) }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ connected: false, category: databaseFailure(error), message: "Check backend environment, Atlas database-user credentials, network access and database name. No credentials were logged." }));
  process.exitCode = 1;
} finally { await mongoose.disconnect(); }
