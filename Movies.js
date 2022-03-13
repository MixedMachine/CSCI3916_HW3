let mongoose = require('mongoose');
let Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

try {
    mongoose.connect( `${process.env.DB}${process.env.MOVIES_COL}`, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}

// movie schema
let MovieSchema = new Schema({
    title: { type: String, required: true },
    year: Number,
    genre: String,
    actors: [{actorName: String, characterName: String}]
});

//return the model to server
module.exports = mongoose.model('Movie', MovieSchema);