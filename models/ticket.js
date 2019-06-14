var mongoose = require('mongoose');

var TicketSchema = new mongoose.Schema({
    eventID: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        required: true
    },
    userID: {
        type: String
    }
});
var Ticket = mongoose.model('ticket', TicketSchema);
module.exports = Ticket;