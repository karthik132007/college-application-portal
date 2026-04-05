import { Router } from "express";
import { createNotification, getNotifications, deleteNotification } from "../controllers/notification.controller.js";

const notificationRouter = Router();

// Retrieve all notifications (public/students)
notificationRouter.get('/', getNotifications);

// Admin-level operations
notificationRouter.post('/', createNotification);
notificationRouter.delete('/:id', deleteNotification);

export default notificationRouter;
