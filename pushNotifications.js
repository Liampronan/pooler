//google cloud messenger for android push notifications
var gcm = require('node-gcm'),
    mongoose = require('mongoose'),
    User = mongoose.model('Puser'),
    tripMatchEmitter = require('./server/controllers/users').tripMatchEmitter;

//apple push noticiations
//var apn = require('apn'),
//  options = {
//    cert: 'dist_cert.pem',
//    key: 'prod_dist.pem',
//    production: true
//  },
//  apnConnection = new apn.Connection(options);

User.findOne({pushInfo: {$exists: true}}, function(err, user){
  var options = {
    droidTitle: 'yooo',
    message: 'suppp broo'
  }
  sendPushNotification([user], options)
})

tripMatchEmitter.on('tripMatch', function(matchUsersUberids){
    User.find({ uberid: { $in: matchUsersUberids } }, function(err, users){
      if (err) console.error(err)
      console.log('trip match push users', users);
      var options = {
        droidTitle: 'Pooler: Trip Match',
        message: 'New match for one of your trips'
      }
      sendPushNotification(users, options);
    })
})


function sendPushNotification(users, options){
  console.log('sending push to', users);
  users.forEach(function(user){
    if (!user.pushInfo || !user.pushInfo.regid ) return //no device registered - helpful for testing and users w/o push
    if (user.pushInfo.device === 'iOS'){
      sendAPN(user, options);
    } else if (user.pushInfo.device === 'Android'){
      sendGCM(user, options);
    }
  })
}

function sendAPN(user, options){
  console.log('user ', user);

  var myDevice = new apn.Device(user.pushInfo.regid),
    note = new apn.Notification();

  note.expiry = Math.floor(Date.now() / 1000) + (3600 * 12); // Expires 12 hours from now.
  note.alert = options.iOSTitle;
  apnConnection.pushNotification(note, myDevice);
}

function sendGCM(user, options){
  var message = new gcm.Message({
      data: {
        title: options.droidTitle,
        message: options.message //TODO: add name to msg ?
      }
    }),
    sender = new gcm.Sender('AIzaSyBUJQKJgTUQiAy1fRE1mzv_IOeGRGdiG2w'),
    registrationIds = [];

  registrationIds.push(user.pushInfo.regid);

  sender.send(message, registrationIds, 4, function (err, result) {
    console.log(result);
  });
}

