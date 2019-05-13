/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var server = require('../server');


var testObjId;

chai.use(chaiHttp);

const startTests = async function (){
  await chai.request(server)
    .delete('/api/issues/clearTestDatabase')
    .send({});
}

startTests();

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {    
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');         
          assert.typeOf(res.body.created_on, 'string')
          assert.typeOf(res.body.updated_on, 'string')
          assert.equal(res.body.open, true)
          assert.typeOf(res.body._id, 'string')
         done();

        })
        });
      
      
      test('Required fields filled in', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Required fields filled in'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.typeOf(res.body.issue_title, 'string');
          assert.typeOf(res.body.issue_text, 'string');
          assert.typeOf(res.body.created_by, 'string');
          assert.isUndefined(res.body.assigned_to);
          assert.isUndefined(res.body.status_text);
          assert.typeOf(res.body.created_on, 'string');
          assert.typeOf(res.body.updated_on, 'string');
          assert.equal(res.body.open, true);
          assert.typeOf(res.body._id, 'string');
               testObjId = res.body._id //sets up a test _id to use later in tests   
          done();
        })        
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({})
        .end(function(err, res) {
          assert.equal(res.text, 'Please complete all required fields');
          done();
        })
          
        })
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({_id: testObjId})
        .end(function(err, res){
          assert.equal(res.text, 'no updated field sent')
          done()
        });
      });
      
      test('One field to update', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: testObjId,
            created_by: "Name"
          })
          .end(function(err, res){
            assert.equal(res.text, 'successfully updated')
            done()
        })
        
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: testObjId,
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Every field filled in',
            assigned_to: 'Chai and Mocha',
            status_text: 'In QA'
          })
          .end(function(err,res){
            assert.equal(res.text, 'successfully updated')
            done()
        });
        
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on')
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test?open=true')
        .end(function(err, res){
          assert.equal(res.status, 200)
          assert.isArray(res.body);
          assert.equal(res.body[0].open, true)
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/test?open=true&issue_title=Title')
        .end(function(err,res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          expect(res.body).to.have.lengthOf(2);
          assert.equal(res.body[0].issue_title, 'Title');
          done()
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({_id: null})
        .end(function(err,res){
          console.log(res.text)
          assert.equal(res.text, '_id error')
          done()
        });
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({_id: testObjId})
          .end(function(err,res){
            assert.equal(res.text, `deleted ${testObjId}`)
            done();
        });     
        
      });
      
    });

});
