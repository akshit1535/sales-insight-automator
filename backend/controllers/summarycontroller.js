const fs = require("fs");
const csv = require("csv-parser");
const validator = require("validator");

const { getAISummary } = require("../utils/aiservice");
const { sendEmail } = require("../utils/emailService");

exports.generateSummary = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const email = req.body.email;

    if (!email || !validator.isEmail(email)) {
        return res.status(400).json({ error: "A valid email is required" });
    }

    if (!filePath.endsWith(".csv")) {
        return res
            .status(400)
            .json({ error: "Only CSV files are supported in this prototype" });
    }

    const rows = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", async () => {
            try {
                const summary = await getAISummary(rows);

                await sendEmail(email, summary);

                return res.json({
                    message: "Summary generated and email sent",
                    summary
                });
            } catch (error) {
                console.error("Error generating summary:", error);

                return res.status(500).json({
                    error: "Failed to generate summary"
                });
            }
        })
        .on("error", (error) => {
            console.error("Error reading CSV:", error);
            return res.status(500).json({ error: "Failed to read CSV file" });
        });
};