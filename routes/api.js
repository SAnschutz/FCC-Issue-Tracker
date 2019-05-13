/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var db = require('mongodb').db
var ObjectId = require('mongodb').ObjectID;
var dbase;

const CONNECTION_STRING = process.env.DB;

MongoClient.connect(CONNECTION_STRING, function(err, db) {
    if (err) return console.log('db connect error')
    dbase = db
    console.log('connected')
});


module.exports = function (app) {


    app.route('/api/issues/:project')
  
    .get(function (req, res){
      
      var project = req.params.project;
      var queryItems = req.query;
      if (req.query.open) {
        req.query.open = JSON.parse(req.query.open)
      }

      try {
      dbase.collection(project).find(queryItems).toArray(function(err, results){
        res.status(200).send(results);
      })
      } catch(e) {
        return console.log(e)
      }
    
      
    })
    
    .post(function (req, res){
      var project = req.params.project;
      var current_time = new Date();

      try {
      let issue = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by, 
        assigned_to: req.body.assigned_to, 
        status_text: req.body.status_text,
        created_on: current_time,
        updated_on: current_time,
        open: true,
        _id: new ObjectId()
      }
      
      if (!issue.issue_title || !req.body.issue_text || !req.body.created_by) {
        return res.send('Please complete all required fields');
      }

    dbase.collection(project).save(issue, (err, result) => {
      if (err) {
        throw new Error;
      }
      res.send(issue)
      
    })
  } catch(e){
    console.log(e);
  }})
    
    .put(function (req, res){
      var project = req.params.project;
      var _id = ObjectId(req.body._id)
      var current_time = new Date()
      
      var updatedFields = Object.keys(req.body);
      var updates = {}
      updatedFields.forEach((field) => {
        if (req.body[field].length > 0){
          updates[field] = req.body[field]
        }
      })
        if (req.body.open){
          updates.open = JSON.parse(updates.open)
        }
      
      delete updates["_id"]
      
      if (Object.keys(updates).length < 1){
        return res.send('no updated field sent');
      }
      
      try {
        var currentDoc = dbase.collection(project).findOne({_id})
        if (!currentDoc){
          return res.send(`could not update ${_id}`)
        }


        dbase.collection(project).update({_id},
          {
            $set: {
              ...updates,
              updated_on: current_time,
           }
        })
        res.send('successfully updated')

      } catch(e) {
        res.send(`could not update ${_id}`)
      }
    })
      
    
    .delete(function (req, res){
      var project = req.params.project;

      if (project === 'clearTestDatabase'){
        dbase.collection('test').removeMany({})
      }

      if (!req.body._id){
        res.send('_id error')
      }
      
      var _id = ObjectId(req.body._id)

      
      
      try {
        dbase.collection(project).remove({_id})
        res.send(`deleted ${_id}`)
      } catch(e) {
        res.send(`could not delete ${_id}`)
      }
      
    })
  
    
};
