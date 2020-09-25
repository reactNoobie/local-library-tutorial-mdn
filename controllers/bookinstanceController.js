var validator = require('express-validator');
var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');

// Display list of all BookInstances.
exports.bookinstance_list = function (req, res, next) {
    BookInstance.find({})
        .populate('book')
        .exec(function (err, bookinstance_list) {
            if (err) {
                return next(err);
            }
            res.render('bookinstance_list', { title: 'Book instance list', bookinstance_list: bookinstance_list });
        });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function (req, res, next) {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function (err, bookinstance) {
            if (err) {
                return next(err);
            }
            if (bookinstance == null) {
                var error = new Error('Bookinstance not found');
                error.status = 404;
                return next(error);
            }
            res.render('bookinstance_detail', { title: 'Bookinstance detail', bookinstance: bookinstance });
        });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function (req, res, next) {
    Book.find()
        .exec(function (err, book_list) {
            if (err) {
                return next(err);
            }
            res.render('bookinstance_form', { title: 'Create Book Instance', book_list: book_list });
        });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    // Validate
    validator.body('book').trim().isLength({ min: 1 }).withMessage('Book must be specified'),
    validator.body('imprint').trim().isLength({ min: 1 }).withMessage('Please specify an imprint'),
    validator.body('due_back').isISO8601().withMessage('Please specify a valid date'),

    // Sanitize
    validator.sanitizeBody('book').escape(),
    validator.sanitizeBody('imprint').escape(),
    validator.sanitizeBody('status').trim().escape(),
    validator.sanitizeBody('due_back').toDate(),

    // Process
    function (req, res, next) {
        var bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });
        var errors = validator.validationResult(req);
        if (!errors.isEmpty()) {
            Book.find().exec(function (error, book_list) {
                res.render('bookinstance_form', {
                    title: 'Create Book Instance',
                    bookinstance: bookInstance,
                    book_list: book_list,
                    selected_book: bookInstance.book._id,
                    errors: errors.array()
                });
            });
        } else {
            bookInstance.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect(bookInstance.url);
            });
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function (req, res, next) {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function (err, bookinstance) {
            if (err) {
                return next(err);
            }
            if (bookinstance === null) {
                res.redirect('/catalog/bookinstances');
            } else {
                res.render('bookinstance_delete', { title: 'Delete Book Instance', bookinstance: bookinstance });
            }
        });
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function (req, res) {
    BookInstance.findByIdAndRemove(req.body.bookinstanceid, function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/catalog/bookinstances');
    });
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function (req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};