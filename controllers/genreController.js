var validator = require('express-validator');

var async = require('async');

var Book = require('../models/book');
var Genre = require('../models/genre');

// Display list of all Genre.
exports.genre_list = function (req, res, next) {
    Genre.find()
        .sort([['name', 'descending']])
        .exec(function (err, genre_list) {
            if (err) {
                next(err);
            }
            res.render('genre_list', { title: 'Genre list', genre_list: genre_list });
        });
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res, next) {
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id)
                .exec(callback);
        },
        genre_books: function (callback) {
            Book.find({ 'genre': req.params.id })
                .exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.genre == null) {
            var error = new Error('Genre not found!');
            error.status = 404;
            return next(error);
        }
        res.render('genre_detail', { title: 'Genre detail', genre: results.genre, genre_books: results.genre_books });
    });
};

// Display Genre create form on GET.
exports.genre_create_get = function (req, res, next) {
    res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post = [
    // Validate that name field is not empty
    validator.body('name', 'Genre name required').trim().isLength({ min: 1 }),

    // Sanitize the name field
    validator.sanitizeBody('name').escape(),

    // Process request
    function (req, res, next) {
        var genre = new Genre({ name: req.body.name });
        var errors = validator.validationResult(req);
        if (!errors.isEmpty()) {
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array() });
        } else {
            // Check if genre already exists
            Genre.findOne({ 'name': req.body.name })
                .exec(function (err, result) {
                    if (err) {
                        return next(err);
                    }
                    if (result) {
                        res.redirect(result.url);
                    } else {
                        genre.save(function (err) {
                            if (err) {
                                return next(err);
                            }
                            res.redirect(genre.url);
                        });
                    }
                });
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};
