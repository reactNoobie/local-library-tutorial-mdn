var validator = require('express-validator');
var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');

var async = require('async');

exports.index = function (req, res) {
	async.parallel({
		book_count: function (callback) {
			Book.countDocuments({}, callback);
		},
		book_instance_count: function (callback) {
			BookInstance.countDocuments({}, callback);
		},
		book_instance_available_count: function (callback) {
			BookInstance.countDocuments({ status: 'Available' }, callback);
		},
		author_count: function (callback) {
			Author.countDocuments({}, callback);
		},
		genre_count: function (callback) {
			Genre.countDocuments({}, callback);
		}
	}, function (err, results) {
		res.render('index', { title: 'Local library home', error: err, data: results });
	});
};

// Display list of all books.
exports.book_list = function (req, res, next) {
	Book.find({})
		.populate('author')
		.exec(function (err, book_list) {
			if (err) {
				return next(err);
			}
			res.render('book_list', { title: 'Book list', book_list: book_list });
		});
};

// Display detail page for a specific book.
exports.book_detail = function (req, res, next) {
	async.parallel(
		{
			book: function (callback) {
				Book.findById(req.params.id)
					.populate('author')
					.populate('genre')
					.exec(callback);
			},
			book_instance: function (callback) {
				BookInstance.find({ 'book': req.params.id })
					.exec(callback);
			},
		}, function (err, results) {
			if (err) {
				return next(err);
			}
			if (results.book == null) {
				var error = new Error('Book not found');
				error.status = 404;
				return next(error);
			}
			res.render('book_detail', { title: results.book.title, book: results.book, book_instances: results.book_instance });
		});
};

// Display book create form on GET.
exports.book_create_get = function (req, res, next) {
	async.parallel({
		authors: function (callback) {
			Author.find(callback);
		},
		genres: function (callback) {
			Genre.find(callback);
		}
	}, function (err, results) {
		if (err) {
			return next(err);
		}
		res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
	});
};

// Handle book create on POST.
exports.book_create_post = [
	// Convert genre to array (as genre is declared as array in the book schema)
	function (req, res, next) {
		if (!(req.body.genre instanceof Array)) {
			if (req.body.genre !== undefined) {
				req.body.genre = new Array(req.body.genre);
			} else {
				req.body.genre = [];
			}
		}
		console.log('Soumik: ', req.body.genre);
		next();
	},

	// Validate
	validator.body('title').trim().isLength({ min: 1 }).withMessage('Title can not be empty'),
	validator.body('author').trim().isLength({ min: 1 }).withMessage('Author can not be empty'),
	validator.body('summary').trim().isLength({ min: 1 }).withMessage('Summary can not be empty'),
	validator.body('isbn').trim().isLength({ min: 1 }).withMessage('ISBN can not be empty'),

	// Sanitize
	validator.sanitizeBody('title').escape(),
	validator.sanitizeBody('author').escape(),
	validator.sanitizeBody('summary').escape(),
	validator.sanitizeBody('isbn').escape(),
	validator.sanitizeBody('genre.*').escape(),

	// Process request
	function (req, res, next) {
		var book = new Book({
			title: req.body.title,
			author: req.body.author,
			summary: req.body.summary,
			isbn: req.body.isbn,
			genre: req.body.genre
		});
		var errors = validator.validationResult(req);
		if (!errors.isEmpty()) {
			async.parallel({
				authors: function (callback) {
					Author.find(callback);
				},
				genres: function (callback) {
					Genre.find(callback);
				}
			}, function (err, results) {
				if (err) {
					return next(err);
				} else {
					results.genres.forEach(genre => genre.checked = book.genre.includes(genre._id));
					res.render('book_form', { title: 'Create Book', book: book, authors: results.authors, genres: results.genres, errors: errors.array() });
				}
			});
		} else {
			book.save(function (err) {
				if (err) {
					return next(err);
				}
				res.redirect(book.url);
			});
		}
	}
];

// Display book delete form on GET.
exports.book_delete_get = function (req, res) {
	res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function (req, res) {
	res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function (req, res) {
	res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function (req, res) {
	res.send('NOT IMPLEMENTED: Book update POST');
};
