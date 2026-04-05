import { Application } from "../models/application.model.js";
import { User } from "../models/user.model.js";

const submitApplication = async (req, res) => {
    try {
        const { userId, ...applicationData } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if an application already exists for this user
        const existingApplication = await Application.findOne({ user: userId });
        if (existingApplication) {
            return res.status(400).json({ message: "Application already submitted for this user" });
        }

        const application = await Application.create({
            user: userId,
            ...applicationData
        });

        res.status(201).json({
            message: "Application submitted successfully!",
            application
        });
    } catch (error) {
        console.error('Submit application error:', error);
        res.status(500).json({ message: "Internal server error!", error: error.message });
    }
};

const getApplication = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const application = await Application.findOne({ user: userId });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.status(200).json({
            application
        });
    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({ message: "Internal server error!", error: error.message });
    }
};

const getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find().populate('user', 'fullName email phone');
        res.status(200).json({ applications });
    } catch (error) {
        console.error('Get all applications error:', error);
        res.status(500).json({ message: "Internal server error!", error: error.message });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const validStatuses = ['Pending', 'Hold', 'Accepted', 'Rejected', 'Student_Accepted'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const application = await Application.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.status(200).json({ message: "Application status updated successfully", application });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ message: "Internal server error!", error: error.message });
    }
};

const studentAcceptApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await Application.findById(id);

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (application.status !== 'Accepted') {
            return res.status(400).json({ message: "Application is not in Accepted state" });
        }

        application.status = 'Student_Accepted';
        await application.save();

        res.status(200).json({ message: "Admission accepted successfully by student", application });
    } catch (error) {
        console.error('Student accept application error:', error);
        res.status(500).json({ message: "Internal server error!", error: error.message });
    }
};

const updateDriveLink = async (req, res) => {
    try {
        const { id } = req.params;
        const { driveLink } = req.body;

        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        application.driveLink = driveLink;
        await application.save();

        res.status(200).json({ message: "Drive link updated successfully", application });
    } catch (error) {
        console.error('Update drive link error:', error);
        res.status(500).json({ message: "Internal server error!", error: error.message });
    }
};

const updateAdminFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { feedback } = req.body;

        const application = await Application.findByIdAndUpdate(
            id,
            { adminFeedback: feedback },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.status(200).json({ message: "Feedback sent successfully", application });
    } catch (error) {
        console.error('Update feedback error:', error);
        res.status(500).json({ message: "Internal server error!", error: error.message });
    }
};

const bookExam = async (req, res) => {
    try {
        const { id } = req.params;
        const { examSlot } = req.body;

        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        application.examSlot = examSlot;
        await application.save();

        res.status(200).json({ message: "Exam slot booked successfully", application });
    } catch (error) {
        console.error('Book exam error:', error);
        res.status(500).json({ message: "Internal server error!", error: error.message });
    }
};

export { submitApplication, getApplication, getAllApplications, updateApplicationStatus, studentAcceptApplication, updateDriveLink, updateAdminFeedback, bookExam };
