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
	res.send('TODO: Author create GET');
};

// Handle Author create on POST
exports.author_create_post = function (req, res) {
	res.send('TODO: Author create POST');
};

// Display Author delete form on GET
exports.author_delete_get = function (req, res) {
	res.send('TODO: Author delete GET');
};

// Handle Author delete on POST
exports.author_delete_post = function (req, res) {
	res.send('TODO: Author delete POST');
};

// Display Author update form on GET
exports.author_update_get = function (req, res) {
	res.send('TODO: Author update GET');
};

// Handle Author update on POST
exports.author_update_post = function (req, res) {
	res.send('TODO: Author update POST');
};

