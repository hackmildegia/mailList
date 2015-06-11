'use strict';
var MailListener = require("mail-listener2");
var email = require("../../node_modules/emailjs/email");
var Promise = require('bluebird');

var IMAPService = {
    start: function startMailListener() {
        var config = sails.config.mailListener;

        var mailListener = new MailListener({
          username: config.username,
          password: config.password,
          host: config.host,
          port: config.port, // imap port
          tls: true,
          tlsOptions: { rejectUnauthorized: false },
          mailbox: config.mailbox, // mailbox to monitor
          // searchFilter: ["UNSEEN", "FLAGGED"], // the search filter being used after an IDLE notification has been retrieved
          markSeen: true, // all fetched email willbe marked as seen and not fetched next time
          fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
          mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
          attachments: true, // download attachments as they are encountered to the project directory
          attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
        });

        mailListener.start(); // start listening

        mailListener.on("server:connected", function(){
          console.log("imapConnected");
        });

        mailListener.on("server:disconnected", function(){
          console.log("imapDisconnected");
        });

        mailListener.on("error", function(err){
          console.log(err);
        });

        /*
        { text: 'a\n',
          headers: 
           { 'return-path': '<email@domain.com>',
             'x-spam-checker-version': 'SpamAssassin 3.4.0 (2014-02-07) on server.domain.net',
             'x-spam-level': '',
             'x-spam-pyzor': '',
             'x-spam-status': 'No, score=0.1 required=8.0 tests=AM_TRUNCATED,NEAR_EMPTY, TO_NOREAL,UNPARSEABLE_RELAY shortcircuit=no autolearn=disabled version=3.4.0',
             'delivered-to': 'email@domain.net',
             received: 
              [ 'from server.doamin.net (server.domain.net [11.11.11.11]) (using TLSv1.2 with cipher ECDHE-RSA-AES256-GCM-SHA384 (256/256 bits)) (Client CN "*.riseup.net", Issuer "COMODO RSA Domain Validation Secure Server CA" (verified OK)) by server.domain.net (Postfix) with ESMTPS id 371EF9B4 for <email@domain.net>; Wed, 20 May 2015 15:59:38 +0000 (UTC)',
                'from [127.0.0.1] (localhost [127.0.0.1]) (Authenticated sender: username) with ESMTPSA id 3341841FED' ],
             'message-id': '<555CAF67.60001@doamin.com>',
             date: 'Wed, 20 May Username <email@domain.com>',
             'user-agent': 'Mozilla/5.0 (X11; Linux i686; rv:17.0) Gecko/20131005 Icedove/17.0.9',
             'mime-version': '1.0',
             to: 'email@domain.net, email@domain.com',
             subject: 'a',
             'content-type': 'text/plain; charset=ISO-8859-1',
             'content-transfer-encoding': '7bit' },
          subject: 'a',
          messageId: '555CAF67.60001@domain.com',
          priority: 'normal',
          from: [ { address: 'email@domain.com', name: 'username' } ],
          to: 
           [ { address: 'email@domain.net', name: '' },
             { address: 'email@domain.com', name: '' } ],
          date: Wed May 20 2015 17:59:35 GMT+0200 (CEST),
          receivedDate: Wed May 20 2015 17:59:38 GMT+0200 (CEST) }

         */
        mailListener.on("mail", function(mail, seqno, attributes){
          // console.log(mail);
          
          var from = mail.from;
          var listEmail = mail.to;
          var text = mail.text;
          var subject = mail.subject;

          var fromLength = from.length;

          // console.log(from[0].address);
          // console.log(in_array('van', ['Kevin', 'van', 'Zonneveld']));
          // console.log(in_array(from, ['email@domain.com', 'a@a.com', 'b@a.com', 'c@a.com']));
          
          var listPromise =  new Promise(function (resolve, reject) {            
            List
                .findOne({
                    where: {
                        email: listEmail[0].address
                    }
            })
            .populate('members')
            .exec(function(err, list) {
              // res.json(list);
              resolve(list)
            });
          });
            
          listPromise.then(function(list){
            // console.log(1);
            // console.log(list);

            var memberEmails = [];

            _.each(list.members, function(member) {
              memberEmails.push(member.email);
            });
            // console.log(2);
            // console.log(memberEmails);
          // for (var i = 0; i < fromLength; i++) { 
            // if (from in listUsers) {
            if (in_array(from[0].address, memberEmails)) {
              // send email.
              console.log("SEND EMAIL");
             var config = sails.config.mailListener;

              var server  = email.server.connect({
                 user:    config.username, 
                 password:config.password, 
                 host:    config.host, 
                 ssl:     true
              });
              console.log("SERVER OK");

              var message = {
                 subject: subject,
                 from:    from[0].address, 
                 bcc:      memberEmails.toString(),
                 text:    text,
                 "Reply-To": "kaixo@aitoribanez.com",
                 "List-Post": "<mailto:kaixo@aitoribanez.com>"
              }
              
              // send the message and get a callback with an error or details of the message that was sent
              server.send(message, function(err, message) { console.log(err || message); });
            
            } else {
              console.log("SEND TO MODERATE")
            }
          // }
        });

        });

        mailListener.on("attachment", function(attachment){
          console.log(attachment.path);
        });

        // it's possible to access imap object from node-imap library for performing additional actions. E.x.
        // nodemailListener.imap.move(:msguids, :mailboxes, function(){})

        function in_array(needle, haystack, argStrict) {
          //  discuss at: http://phpjs.org/functions/in_array/
          // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
          // improved by: vlado houba
          // improved by: Jonas Sciangula Street (Joni2Back)
          //    input by: Billy
          // bugfixed by: Brett Zamir (http://brett-zamir.me)
          //   example 1: in_array('van', ['Kevin', 'van', 'Zonneveld']);
          //   returns 1: true
          //   example 2: in_array('vlado', {0: 'Kevin', vlado: 'van', 1: 'Zonneveld'});
          //   returns 2: false
          //   example 3: in_array(1, ['1', '2', '3']);
          //   example 3: in_array(1, ['1', '2', '3'], false);
          //   returns 3: true
          //   returns 3: true
          //   example 4: in_array(1, ['1', '2', '3'], true);
          //   returns 4: false

          var key = '',
          strict = !! argStrict;

          //we prevent the double check (strict && arr[key] === ndl) || (!strict && arr[key] == ndl)
          //in just one for, in order to improve the performance 
          //deciding wich type of comparation will do before walk array
          if (strict) {
            for (key in haystack) {
              if (haystack[key] === needle) {
                return true;
              }
            }
          } else {
            for (key in haystack) {
              if (haystack[key] == needle) {
                return true;
              }
            }
          }

          return false;
        } // in_array
    }
}

module.exports = IMAPService;