var validator = require('express-validator');
var async = require('async');

var Author = require('../models/author');
var Book = require('../models/book');

// Display list of all Authors
exports.author_list = function (req, res, next) {
	Author.find()
		.sort([['family_name', 'ascending']])
		.exec(function (err, author_list) {
			if (err) {
				return next(err);
			}
			res.render('author_list', { title: 'Author list', author_list: author_list });
		});
};

// Display detail page for specific Author
exports.author_detail = function (req, res, next) {
	async.parallel({
		author: function (callback) {
			Author.findById(req.params.id)
				.exec(callback);
		},
		author_books: function (callback) {
			Book.find({ 'author': req.params.id })
				.exec(callback);
		},
	}, function (err, results) {
		if (err) {
			return next(err);
		}
		if (results.author == null) {
			var error = new Error('Author not found!');
			error.status = 404;
			return next(error);
		}
		res.render('author_detail', { title: 'Author detail', author: results.author, author_books: results.author_books });
	});
};

// Display Author create form on GET
exports.author_create_get = function (req, res) {
	res.render('author_form', { title: 'Create Author' });
};

// Handle Author create on POST
exports.author_create_post = [
	// Validate data
	validator.body('first_name').isLength({ min: 1 }).trim().withMessage('First name can not be empty')
		.isAlpha().withMessage('First name must contain letters only'),
	validator.body('family_name').isLength({ min: 1 }).trim().withMessage('Family name can not be empty')
		.isAlpha().withMessage('Family name must contain letters only'),
	validator.body('date_of_birth').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid date of birth'),
	validator.body('date_of_death').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid date of death'),

	// Sanitize
	validator.sanitizeBody('first_name').escape(),
	validator.sanitizeBody('family_name').escape(),
	validator.sanitizeBody('date_of_birth').toDate(),
	validator.sanitizeBody('date_of_death').toDate(),

	// Process request
	function (req, res, next) {
		var errors = validator.validationResult(req);
		if (!errors.isEmpty()) {
			res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
		} else {
			var author = new Author({
				first_name: req.body.first_name,
				family_name: req.body.family_name,
				date_of_birth: req.body.date_of_birth,
				date_of_death: req.body.date_of_death
			});
			author.save(function (err) {
				if (err) {
					return next(err);
				}
				res.redirect(author.url);
			});
		}
	}
];

// Display Author delete form on GET
exports.author_delete_get = function (req, res, next) {
	async.parallel({
		author: function (callback) {
			Author.findById(req.params.id).exec(callback);
		},
		author_books: function (callback) {
			Book.find({ 'author': req.params.id }).exec(callback);
		}
	}, function (err, results) {
		if (err) {
			return next(err);
		}
		if (results.author === null) {
			res.redirect('/catalog/authors');
		} else {
			res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.author_books });
		}
	});
};

// Handle Author delete on POST
exports.author_delete_post = function (req, res, next) {
	async.parallel({
		author: function (callback) {
			Author.findById(req.body.authorid).exec(callback);
		},
		author_books: function (callback) {
			Book.find({ 'author': req.body.authorid }).exec(callback);
		}
	}, function (err, results) {
		if (err) {
			return next(err);
		}
		if (results.author_books.length > 0) {
			res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.author_books });
		} else {
			Author.findByIdAndRemove(req.body.authorid, function (err) {
				if (err) {
					return next(err);
				}
				res.redirect('/catalog/authors');
			});
		}
	});
};

// Display Author update form on GET
exports.author_update_get = function (req, res) {
	res.send('TODO: Author update GET');
};

// Handle Author update on POST
exports.author_update_post = function (req, res) {
	res.send('TODO: Author update POST');
};