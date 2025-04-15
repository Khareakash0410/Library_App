import express from "express";
import {getUserborrowedBooks, recordBorrowedBook, getBorrowedBooksForAdmin,returnBorrowedBooks} from "../controllers/borrowController.js";
import {isAuthenticated, isAuthorized} from "../middleware/authMiddleware.js";

const router = express.Router();


// Route for an admin to record the individual book which is borrowed by user----------
router.post("/record-borrow-book/:id", isAuthenticated, isAuthorized("Admin"), recordBorrowedBook);

// Route for admin to update the retrurned books--------
router.put("/return-borrowed-book/:bookId", isAuthenticated, isAuthorized("Admin"), returnBorrowedBooks);

// Route to get user get their borrowed books---------
router.get("/my-borrowed-books", isAuthenticated, getUserborrowedBooks);

// Route for admin to known info of all borrowed borrowed books by users-----
router.get("/borrowed-books-by-users", isAuthenticated, isAuthorized("Admin"), getBorrowedBooksForAdmin);



export default router;