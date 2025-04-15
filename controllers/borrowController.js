import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../middleware/errorMiddleware.js";
import {Borrow} from "../models/borrowModel.js";
import {Book} from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import { calculateFine } from "../utils/fineCalculate.js";




export const recordBorrowedBook = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.params;
    const {email} = req.body;
    const book = await Book.findById(id);
    if (!book) {
        return next(new ErrorHandler("Book not found.", 404));
    };
    const user = await User.findOne({email, accountVerified: true});
    if(!user) {
        return next(new ErrorHandler("User not found.", 404)); 
    };
    if (book.quantity === 0) {
        return next(new ErrorHandler("Book currently not available.", 400)); 
    };
    const isAlreadyBorrowed = user.borrowedBooks.find((b) => b.bookId.toString() === id && b.returned === false);
    if(isAlreadyBorrowed) {
        return next(new ErrorHandler("Book already borrowed.", 400)); 
    };
    book.quantity -= 1;
    book.availability = book.quantity > 0;
    await book.save();
    user.borrowedBooks.push({
        bookId: book._id,
        bookTitle: book.title,
        borrowedDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await user.save();
    await Borrow.create({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
        book: book._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        price: book.price,
    });
    res.status(200).json({
        success: true,
        message: "Book borrowed successfully."
    });
});



export const returnBorrowedBooks = catchAsyncErrors(async (req, res, next) => {
   const {bookId} = req.params;
   const {email} = req.body;
   const book = await Book.findById(bookId);
   if (!book) {
    return next(new ErrorHandler("Book not found.", 404));
   };
   const user = await User.findOne({email, accountVerified: true});
   if(!user) {
    return next(new ErrorHandler("User not found.", 404)); 
   };
   const borrowedBooks = user.borrowedBooks.find((b) => b.bookId.toString() === bookId && b.returned === false);
   if(!borrowedBooks) {
    return  next(new ErrorHandler("Book not borrowed or already return.", 400));
   };
   borrowedBooks.returned = true;
   await user.save();

   book.quantity += 1;
   book.availability = book.quantity > 0;
   await book.save();

   const borrow = await Borrow.findOne({
      book: bookId,
      "user.email": email,
      returnDate: null,
   });

   if(!borrow) {
    return next(new ErrorHandler("Book not borowed currently.", 400));
   };

   borrow.returnDate = new Date();
   const fine = calculateFine(borrow.dueDate);
   borrow.fine = fine; 
   await borrow.save();
   res.status(200).json({
    success: true,
    message: fine !== 0 ? `Book returned successfully and amount to be paid with Fine is ₹${book.price + fine}` : `Book returned successfully and amount to be paid is ₹${book.price}`
   });
});



export const getUserborrowedBooks = catchAsyncErrors(async (req, res, next) => {
    const {borrowedBooks} = req.user;
    res.status(200).json({
        success: true,
        borrowedBooks,
    });
});


export const getBorrowedBooksForAdmin = catchAsyncErrors(async (req, res, next) => {
    const borrowedBooks = await Borrow.find();
    res.status(200).json({
        success: true,
        borrowedBooks,
    });
});


