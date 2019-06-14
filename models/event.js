var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    userID:{
        type: String,
        required: true
    },
    timeStart: {
        type: Date,
        required: true
    },
    gioStart:{
        type: String
    },
    time_End: {
        type: Date,
        required: true
    },
    gioEnd:{
        type: String
    },
    content:{
        type: String,
        required: true
    },
    numTicket:{
        type: Number,
        required: true
    },
    typeEvent:{
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    location_GG:{
        type: String
    },
    price:{
        type: Number
    },
    income:{
        type: Number
    },
    booked:{
        type: Number
    },
    imageUrl: String,
    status: Number
});
EventSchema.index({name: 'text', content: 'text', typeEvent: 'text', location: 'text'});
var Event = mongoose.model('event', EventSchema);
module.exports = Event;