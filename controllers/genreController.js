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
exports.genre_delete_get = function (req, res, next) {
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books: function (callback) {
            Book.find({ 'genre': req.params.id }).exec(callback);
        }
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.genre === null) {
            res.redirect('/catalog/genres');
        } else {
            res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
        }
    });
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res, next) {
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.body.genreid).exec(callback);
        },
        genre_books: function (callback) {
            Book.find({ 'genre': req.body.genreid }).exec(callback);
        }
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.genre_books.length > 0) {
            res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
        } else {
            Genre.findByIdAndRemove(req.body.genreid, function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect('/catalog/genres');
            });
        }
    });
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res, next) {
    Genre.findById(req.params.id).exec(function (err, genre) {
        if (err) {
            return next(err);
        }
        if (genre === null) {
            var error = new Error('Genre not found');
            error.status = 404;
            return next(error);
        }
        res.render('genre_form', { title: 'Update Genre', genre: genre });
    });
};

// Handle Genre update on POST.
exports.genre_update_post = [
    validator.body('name').trim().isLength({ min: 2 }).withMessage('Genre name must contain at least 2 characters'),
    validator.sanitizeBody('name').escape(),
    function (req, res, next) {
        var genre = new Genre({ name: req.body.name, _id: req.params.id });
        var errors = validator.validationResult(req);
        if (!errors.isEmpty()) {
            res.render('genre_form', { title: 'Update Genre', genre: genre, errors: errors.array() });
        } else {
            Genre.findOne({ 'name': req.body.name })
                .exec(function (err, found_genre) {
                    if (err) {
                        return next(err);
                    }
                    if (found_genre) {
                        res.render('genre_form', { title: 'Update Genre', genre: genre, errors: [{ msg: 'Genre name already exists' }] });
                    } else {
                        Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err, updated_genre) {
                            if (err) {
                                return next(err);
                            }
                            res.redirect(updated_genre.url);
                        });
                    }
                });
        }
    }
];
