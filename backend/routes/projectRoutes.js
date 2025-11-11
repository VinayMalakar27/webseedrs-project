import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from "../controllers/projectController.js";
import { createTask, updateTask, deleteTask } from "../controllers/taskController.js";

const router = express.Router();

router.get("/", protect, getProjects);
router.get("/:id", protect, getProjectById);
router.post("/", protect, createProject);
router.patch("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);

router.post("/:id/members", protect, addMember);
router.delete("/:id/members/:memberId", protect, removeMember);

router.post("/:projectId/tasks", protect, createTask);
router.patch("/:projectId/tasks/:taskId", protect, updateTask);
router.delete("/:projectId/tasks/:taskId", protect, deleteTask);

export default router;
