/**
* List.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var List = {

  attributes: {
    name: 'string',
    email: 'string',
    members: { collection: 'user', via: 'lists' }
  }
};

module.exports = List;
