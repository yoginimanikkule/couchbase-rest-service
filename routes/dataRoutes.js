const express = require("express");
const router = express.Router();
const db = require("../config/couchbase"); // Import Couchbase connection

/**
 * Submit Treatment - Updates treatment status to 'submitted'
 */
router.post("/submitTreatment", async (req, res) => {
  console.log("➡️ [START] Processing submitTreatment request...");

  try {
      const { bucket, scope } = await db;
      if (!bucket) throw new Error("Couchbase bucket not found.");

      const collection = scope.collection("PatientTreatment");
      const { id } = req.body;
      if (!id) return res.status(400).json({ status: 400, error: "Missing treatment ID." });

      // Check document existence
      const exists = await collection.exists(id);
      if (!exists.exists) return res.status(404).json({ status: 404, error: "Treatment record not found." });

      // Fetch treatment record
      const result = await collection.get(id);
      console.log("🟢 Retrieved Treatment Record:", JSON.stringify(result.content));

      // Update treatment status
      const updatedData = { ...result.content, status: "submitted", treatmentStatus: "submitted" };
      await collection.upsert(id, updatedData);
      
      console.log(`✅ Treatment ${id} submitted successfully.`);
      console.log("🟢 Updated Treatment Record:", JSON.stringify(updatedData));

      return res.status(200).json({ status: 200, message: "Treatment submitted successfully .", data: updatedData });

  } catch (error) {
      console.error("❌ Error in submitTreatment:", error.message);
      return res.status(500).json({ status: 500, error: error.message });
  }
});



/**
 * Get All Treatments
 */
router.get("/getAll", async (req, res) => {
    try {
        const { bucket } = await db;
        if (!bucket) throw new Error("Couchbase bucket not found.");

        const query = `SELECT t.* FROM \`${process.env.CB_BUCKET}\`._default.PatientTreatment`;
        console.log("Executing Query:", query);

        const result = await bucket.cluster.query(query);

        console.log(`✅ Retrieved ${result.rows.length} treatments.`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("❌ Error in getAll:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Treatment Count
 */
router.get("/count", async (req, res) => {
    try {
        const { bucket } = await db;
        if (!bucket) throw new Error("Couchbase bucket not found.");

        const query = `SELECT COUNT(*) AS count FROM \`${process.env.CB_BUCKET}\`._default.PatientTreatment`;
        console.log("Executing Query:", query);

        const result = await bucket.cluster.query(query);

        console.log(`✅ Total treatments: ${result.rows[0].count}`);
        res.status(200).json({ count: result.rows[0].count });
    } catch (error) {
        console.error("❌ Error in count:", error);
        res.status(500).json({ error: error.message });
    }
});

router.post("/pullTreatmentTransfer", async (req, res) => {
    console.log("➡️ [START] Processing pullTreatmentTransfer request...");

    try {
        const { bucket, scope } = await db;
        if (!bucket) throw new Error("Couchbase bucket not found.");

        const collection = scope.collection("PatientTreatment");
        const { hospitalId, id, ownerId } = req.body;
        if (!id || !ownerId) return res.status(400).json({ status: 400, error: "Missing required parameters." });

        // Check document existence
        const exists = await collection.exists(id);
        if (!exists.exists) return res.status(404).json({ status: 404, error: "Treatment record not found." });

        // Fetch treatment record
        const result = await collection.get(id);
        console.log("🟢 Retrieved Treatment Record:", JSON.stringify(result.content));

        // Update ownerId
        const updatedData = { ...result.content, ownerId };
        await collection.upsert(id, updatedData);
        
        console.log(`✅ Treatment ${id} transferred to owner ${ownerId} successfully.`);
        console.log("🟢 Updated Treatment Record:", JSON.stringify(updatedData));

        return res.status(200).json({ status: 200, message: "Treatment transferred successfully.", data: updatedData });
    } catch (error) {
        console.error("❌ Error in pullTreatmentTransfer:", error.message);
        return res.status(500).json({ status: 500, error: error.message });
    }
});

router.post("/pushTreatmentTransfer", async (req, res) => {
    console.log("➡️ [START] Processing pushTreatmentTransfer request...");

    try {
        const { bucket, scope } = await db;
        if (!bucket) throw new Error("Couchbase bucket not found.");

        const collection = scope.collection("PatientTreatment");
        const { hospitalId, id } = req.body;
        if (!id) return res.status(400).json({ status: 400, error: "Missing treatment ID." });

        // Check document existence
        const exists = await collection.exists(id);
        if (!exists.exists) return res.status(404).json({ status: 404, error: "Treatment record not found." });

        // Fetch treatment record
        const result = await collection.get(id);
        console.log("🟢 Retrieved Treatment Record:", JSON.stringify(result.content));

        // Clear ownerId
        const updatedData = { ...result.content, ownerId: "" };
        await collection.upsert(id, updatedData);
        
        console.log(`✅ Treatment ${id} ownership cleared successfully.`);
        console.log("🟢 Updated Treatment Record:", JSON.stringify(updatedData));

        return res.status(200).json({ status: 200, message: "Treatment ownership cleared successfully.", data: updatedData });
    } catch (error) {
        console.error("❌ Error in pushTreatmentTransfer:", error.message);
        return res.status(500).json({ status: 500, error: error.message });
    }
});

module.exports = router;
