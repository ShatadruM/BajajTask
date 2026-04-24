import { processNodes } from '../utils/treeProcessor.js';

// TODO: Replace with your actual credentials 
const USER_ID = "shatadrumukhopadhyay_16122004"; 
const EMAIL_ID = "shatadru_mukhopadhyay@srmap.edu.in";
const COLLEGE_ROLL_NUMBER = "AP23110010732";

export const handleBfhlPost = (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid input. 'data' array is required." });
    }

    // Process the data array using our utility function
    const processedResult = processNodes(data);

    // Construct the final response payload [cite: 14]
    const response = {
      user_id: USER_ID,
      email_id: EMAIL_ID,
      college_roll_number: COLLEGE_ROLL_NUMBER,
      hierarchies: processedResult.hierarchies,
      invalid_entries: processedResult.invalid_entries,
      duplicate_edges: processedResult.duplicate_edges,
      summary: processedResult.summary
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};