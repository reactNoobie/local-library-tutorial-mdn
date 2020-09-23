var moment = require('moment');

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
    {
        first_name: { type: String, required: true, maxlength: 100 },
        family_name: { type: String, required: true, maxlength: 100 },
        date_of_birth: { type: Date },
        date_of_death: { type: Date },
    }
);

// Virtual for author's full name
AuthorSchema
.virtual('name')
.get(function () {
    var fullname = '';
    if (this.first_name && this.family_name) {
        fullname = `${this.family_name}, ${this.first_name}`;
    }
    return fullname;
});

// Virtual for author's lifespan
AuthorSchema
.virtual('lifespan')
.get(function () {
    return `${this.date_of_birth ? moment(this.date_of_birth).format('MMMM Do, YYYY') : ''}
    -
    ${this.date_of_death ? moment(this.date_of_death).format('MMMM Do, YYYY') : ''}`;
});

// Virtual for author's url
AuthorSchema
.virtual('url')
.get(function () {
    return `/catalog/author/${this._id}`;
});

// Export model
module.exports = mongoose.model('Author', AuthorSchema);
