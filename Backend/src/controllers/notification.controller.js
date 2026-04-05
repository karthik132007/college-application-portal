import { Notification } from "../models/notification.model.js";

const createNotification = async (req, res) => {
    try {
        const { title, message, type } = req.body;
        
        if (!title || !message) {
            return res.status(400).json({ message: "Title and message are required" });
        }

        const notification = await Notification.create({ title, message, type });
        
        res.status(201).json({ message: "Notification created successfully", notification });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ message: "Internal server error!", error: error.message });
    }
};

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: "Internal server error!", error: error.message });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndDelete(id);
        
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: "Internal server error!", error: error.message });
    }
};

export { createNotification, getNotifications, deleteNotification };
