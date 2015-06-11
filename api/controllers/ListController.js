/**
 * ListController
 *
 * @description :: Server-side logic for managing lists
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Promise = require('bluebird');

module.exports = {
  index: function (req, res, next) {
    List.find(function foundLists (err, lists) {
      if (err) return  next(err);
      
      res.view({
        lists: lists
      });
    });
  },

  members: function (req, res, next) {
    var members = '';

    List.find(req.param('id')).populate('members').exec(
      function(err, list) { 
        if (err) { 
          res.negotiate(err); 
        } else { 
          // res.ok(list);
          res.view( {
            members: list
          });
        } 
    })
  },

  addMembers: function (req, res, next) {
      var id = req.param('id');
      var emails = req.param('users');
      
      var listPromise =  new Promise(function (resolve, reject) {            
        List.findOne(id)
        .populate('members')
        .exec(function(err, list) {
          // res.json(list);
          resolve(list)
        });
      });
        
      listPromise.then(function(list){
        console.log(1);
        res.ok();
        
        var memberEmails = _.map(list.members, function(member){
          return member.email
        });

        var newMembers = _.difference(emails, memberEmails);
// console.log(newMembers);
        if (newMembers.length > 0) {
         
          _.each(newMembers, function(email) {
            User
              .findOne({
                  where: {
                    email: email
                  }
              })
              .exec(function(err, existingUser) {
                console.log(existingUser)
                var userPromise =  new Promise(function (resolve, reject) { 
                  if(existingUser) {
                    resolve(existingUser);
                  } else {
                    console.log("creating user...")
                    User.create({email:email}).exec(function(err, newuser) {
                       console.log(err);
                     console.log("newuser");
                      console.log(newuser);
                      resolve(newuser);
                    })
                  }
                });

                userPromise.then(function(user) {
                    list.members.add(user.id);
                    list.save(function(err) {}); 
                });
              });
          })
        }
      });
    }
};

