import { Router } from "express";
import { submitApplication, getApplication, getAllApplications, updateApplicationStatus, studentAcceptApplication, updateDriveLink, updateAdminFeedback, bookExam } from "../controllers/application.controller.js";

const applicationRouter = Router();

applicationRouter.post('/submit', submitApplication);
applicationRouter.get('/user/:userId', getApplication);

// Admin routes (ideally should have an admin middleware to protect these)
applicationRouter.get('/all', getAllApplications);
applicationRouter.put('/:id/status', updateApplicationStatus);
applicationRouter.put('/:id/feedback', updateAdminFeedback);

// Student route
applicationRouter.put('/:id/student-accept', studentAcceptApplication);
applicationRouter.put('/:id/drive-link', updateDriveLink);
applicationRouter.put('/:id/book-exam', bookExam);

export default applicationRouter;
