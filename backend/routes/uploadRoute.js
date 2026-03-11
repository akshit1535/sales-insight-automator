const express = require("express");
const multer = require("multer");
const rateLimit = require("express-rate-limit");

const { generateSummary } = require("../controllers/summarycontroller");

const router = express.Router();

const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20
});

const apiKeyMiddleware = (req, res, next) => {
    const apiKeyHeader = req.header("x-api-key");

    if (!process.env.API_KEY) {
        return res.status(500).json({ error: "Server API key not configured" });
    }

    if (!apiKeyHeader || apiKeyHeader !== process.env.API_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    next();
};

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a sales CSV file and trigger AI summary email.
 *     tags:
 *       - Upload
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Sales data file in CSV format.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Recipient email address.
 *     responses:
 *       200:
 *         description: Summary generated and email sent successfully.
 *       400:
 *         description: Invalid request or missing parameters.
 *       401:
 *         description: Unauthorized (missing or invalid API key).
 *       500:
 *         description: Server error while generating summary.
 */
router.post(
    "/upload",
    uploadLimiter,
    apiKeyMiddleware,
    upload.single("file"),
    generateSummary
);

module.exports = router;