import { ExamSlot } from "../models/examSlot.model.js";

const getSlots = async (req, res) => {
    try {
        const slots = await ExamSlot.find({ isActive: true }).sort({ date: 1 });
        res.status(200).json({ slots });
    } catch (error) {
        res.status(500).json({ message: "Error fetching slots", error: error.message });
    }
};

const createSlot = async (req, res) => {
    try {
        const { date, time } = req.body;
        if (!date || !time) {
            return res.status(400).json({ message: "Date and Time are required" });
        }
        const newSlot = await ExamSlot.create({ date, time, isActive: true });
        res.status(201).json({ message: "Slot created successfully", slot: newSlot });
    } catch (error) {
        res.status(500).json({ message: "Error creating slot", error: error.message });
    }
};

const deleteSlot = async (req, res) => {
    try {
        const { id } = req.params;
        await ExamSlot.findByIdAndDelete(id);
        res.status(200).json({ message: "Slot deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting slot", error: error.message });
    }
};

export { getSlots, createSlot, deleteSlot };
