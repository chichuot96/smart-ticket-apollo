var mongoose = require('mongoose');
var crypto = require('crypto');
const saltLength = 7;
const algorithName = 'sha256';

var MemberSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    salt: {
        type: String,
        trim: true
    },
    fullName: {
        type: String,
        required: true
    },
    avatarUrl: {
        type: String
    },
    email:{
        type: String,
        required: true
    },
    role: {
        type: String
    }
});

MemberSchema.statics.authenticate = function (username, password, callback) {
    MemberModel.findOne({
        'username': username
    }, function (error, member) {
        if (error || !member) {
            var err = new Error('Member not found.');
            err.status = 401;
            return callback(err);
        } else {
            var inputPassword = password;
            var salt = member.salt;
            var passwordHash = member.password;

            var algorith = crypto.createHmac(algorithName, salt); // tạo thuật toán.
            var passwordHashToCompare = algorith.update(inputPassword).digest('hex'); // băm chuỗi password đầu vào.
            if (passwordHashToCompare === passwordHash) {
                return callback(null, member);
            } else {
                var err = new Error('Member not found.');
                err.status = 401;
                return callback(err);
            }
        }
    });
}

MemberSchema.pre('save', function (next) {
    var obj = this;
    var salt = generateSalt(saltLength); // tạo muối.
    var algorith = crypto.createHmac(algorithName, salt); // tạo thuật toán.
    var passwordHash = algorith.update(obj.password).digest('hex'); // băm chuỗi password đầu vào.
    obj.password = passwordHash;
    obj.salt = salt;
    next();
});

function generateSalt(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

var MemberModel = mongoose.model('members', MemberSchema);
module.exports = MemberModel;