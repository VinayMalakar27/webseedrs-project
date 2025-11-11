import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let projectsCount = 0;
    let tasksCount = 0;

    if (userRole === "admin") {
      projectsCount = await Project.countDocuments({ createdBy: userId });
      tasksCount = await Task.countDocuments();
    } else {
      projectsCount = await Project.countDocuments({ members: userId });
      tasksCount = await Task.countDocuments({ assignedTo: userId });
    }

    res.json({ projectsCount, tasksCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;