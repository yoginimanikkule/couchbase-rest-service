const couchbase = require('couchbase');
require('dotenv').config(); // Load environment variables

const clusterConnStr = process.env.CB_HOST || "couchbases://cb.4lir3colxxt9cgtk.cloud.couchbase.com";
const username = process.env.CB_USER || "backup@Admin1";
const password = process.env.CB_PASSWORD || "Matrix@123";
const bucketName = process.env.CB_BUCKET || "pathtest";
const scopeName = process.env.CB_SCOPE || "_default";


async function connectToCouchbase() {
  try {
      console.log(`🔄 Connecting to Couchbase at ${clusterConnStr}`);
      const cluster = await couchbase.connect(clusterConnStr, {
          username,
          password,
          configProfile: "wanDevelopment",
      });

      console.log("✅ Connected to Couchbase.");

      const bucket = cluster.bucket(bucketName);
      console.log(`🔹 Using bucket: ${bucketName}`);

      const scope = bucket.scope(scopeName);
      console.log(`🔹 Using scope: ${scopeName}`);

      return { cluster, bucket, scope };
  } catch (err) {
      console.error("❌ Couchbase Connection Error:", err);
      throw err;
  }
}

module.exports = connectToCouchbase();