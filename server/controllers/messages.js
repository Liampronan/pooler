var mongoose = require('mongoose');
var User = mongoose.model('Puser');
var Message  = mongoose.model('Pmessage');
var ObjectId = require('mongoose').Types.ObjectId;
var utils = require('../../lib/utils');

var EventEmitter = require('events').EventEmitter,
  messageEmitter;

mongoose.set('debug', true);

exports.messageEmitter = messageEmitter = new EventEmitter();


exports.create = function(req, res){

  var toUberid = req.body.toUberid,
      fromUberid = req.body.fromUberid,
      messageText = req.body.message,
      message = new Message({
        toUberid: toUberid,
        fromUberid: fromUberid,
        message: messageText
      }),
      messageUberids = [toUberid, fromUberid];

  message.save(function(err, message){
    if (err) console.error(err);
    messageEmitter.emit('newMessage', messageUberids)
    return res.json(200, message)
  })
}


exports.index = function(req, res){
  var uberid = req.query.uberid;

  Message.find({ $or:
    [ { toUberid: uberid },
      { fromUberid: uberid }
    ]

  }, function(err, messages){
    if (err) return console.error(err);
    return res.json(200, messages);
  })
}


exports.markRead = function(req, res){
  var readMessages = req.body.readMessages;

  Message.update({ '_id': { $in: readMessages } },
    { $set: { readByReceiver: true } },
    { multi: true },
    function(err, result){
      if (err) console.error(err)
      return res.json(200, result)
    })
}
