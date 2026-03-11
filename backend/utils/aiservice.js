const axios = require("axios");

exports.getAISummary = async (data) => {

    const prompt = `
    Analyze the following sales data and generate a short executive summary
    highlighting key trends, top regions, and revenue insights.

    ${JSON.stringify(data)}
    `;

    const response = await axios.post(

        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,

        {
            contents: [
                {
                    parts: [{ text: prompt }]
                }
            ]
        }

    );

    return response.data.candidates[0].content.parts[0].text;
};