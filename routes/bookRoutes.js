import express from "express";
import {addBook, deleteBook, getAllBooks} from "../controllers/bookController.js";
import {isAuthenticated, isAuthorized} from "../middleware/authMiddleware.js"


const router = express.Router();


router.post("/add", isAuthenticated, isAuthorized("Admin"), addBook);
router.get("/all", isAuthenticated, getAllBooks);
router.delete("/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteBook);




export default router;