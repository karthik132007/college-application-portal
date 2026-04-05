import { ImportantDate } from "../models/importantDate.model.js";

const getDates = async (req, res) => {
    try {
        let dates = await ImportantDate.findOne();
        if (!dates) {
            // Create a default singleton if it doesn't exist
            dates = await ImportantDate.create({});
        }
        res.status(200).json({ dates });
    } catch (error) {
        console.error('Get dates error:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const updateDates = async (req, res) => {
    try {
        let dates = await ImportantDate.findOne();
        if (!dates) {
            dates = new ImportantDate();
        }

        const { openDate, closeDate, resultsDate, acceptDate, collegeDate } = req.body;

        if (openDate !== undefined) dates.openDate = openDate;
        if (closeDate !== undefined) dates.closeDate = closeDate;
        if (resultsDate !== undefined) dates.resultsDate = resultsDate;
        if (acceptDate !== undefined) dates.acceptDate = acceptDate;
        if (collegeDate !== undefined) dates.collegeDate = collegeDate;

        await dates.save();

        res.status(200).json({ message: "Important dates updated successfully", dates });
    } catch (error) {
        console.error('Update dates error:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export { getDates, updateDates };
