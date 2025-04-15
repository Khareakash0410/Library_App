import express from "express";
import {getUsers, registerNewAdmin} from "../controllers/userController.js";
import {isAuthenticated, isAuthorized} from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/all", isAuthenticated, isAuthorized("Admin"), getUsers);

router.post("/newAdmin", isAuthenticated, isAuthorized("Admin"), registerNewAdmin);





export default router;