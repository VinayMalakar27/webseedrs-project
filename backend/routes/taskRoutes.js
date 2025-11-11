import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Task from "../models/Task.js";
import Project from "../models/Project.js";

const router = express.Router();

// Get all tasks (admin sees all, member sees assigned to them)
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let filter = {};
    if (userRole === "member") {
      filter = { assignedTo: userId };
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("projectId", "title")
      .limit(10);

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get tasks for a specific project
router.get("/project/:projectId", protect, async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ projectId })
      .populate("assignedTo", "name email");
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create task (admin only)
router.post("/:projectId", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { title, assignedTo } = req.body;
    const { projectId } = req.params;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const task = new Task({
      title,
      projectId,
      assignedTo: assignedTo || null,
      status: "todo",
    });

    await task.save();
    await task.populate("assignedTo", "name email");
    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task status (admin or assigned member)
router.patch("/:taskId", protect, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Only admin or assigned member can update
    if (userRole !== "admin" && task.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    task.status = status || task.status;
    await task.save();
    await task.populate("assignedTo", "name email");
    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete task (admin only)
router.delete("/:taskId", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { taskId } = req.params;
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task deleted", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
