const couchbase = require('couchbase');
require('dotenv').config(); // Load environment variables

const clusterConnStr = process.env.CB_HOST || "couchbases://cb.bkgkcrighu-drfh0.cloud.couchbase.com";
const username = process.env.CB_USER || "admin";
const password = process.env.CB_PASSWORD || "Matrix@1234";
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