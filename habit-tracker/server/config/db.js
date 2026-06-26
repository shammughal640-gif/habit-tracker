// config/db.js
// ─────────────────────────────────────────────────────────────
// Establishes the MongoDB connection using Mongoose.
// Called once at server startup; the connection is reused for all queries.
// ─────────────────────────────────────────────────────────────

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `✅  MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`
    );
  } catch (error) {
    console.error(`❌  MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit the process with failure so the server doesn't run without a DB
  }
};

export default connectDB;
