'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');

const { TEST_MONGODB_URI } = require('../config');

const Folder = require('../models/folder');

const { folders } = require('../db/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful Api resource', function(){

  before(
    function () {
      return mongoose
        .connect(TEST_MONGODB_URI)
        .then( () => mongoose.connection.db
          .dropDatabase()
        );
    });
  
  beforeEach(
    function () {
      return Promise.all([
        Folder.insertMany(folders),
        Folder.createIndexes()
      ]);
    }
  ); 

  afterEach( function (){
    return mongoose.connection.db.dropDatabase();
  });

  after( function () {
    return mongoose.disconnect();
  });

  describe( 'Get /api/folders endpoint', function(){
    it('should return all existing folders', function(){
      return Promise.all([
        Folder.find(),
        chai.request(app).get('/api/folders')
      ])
        .then(([data, res])=>{
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(data.length);
          
        });   
    });

  });


  describe( 'GET /api/folders/:id', function(){ 
    it('should return the correct folder', function(){
      let data;
      return Folder.findOne()
        .then(_data =>{
          data = _data;
          return chai.request(app)
            .get(`/api/folders/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res).to.be.an('object');
          expect(res.body).to.have
            .keys('id', 'name','createdAt','updatedAt');
        
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt))
            .to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt))
            .to.eql(data.updatedAt);
        });
    });
    it('should throw error when passed an invalid id', function(){
      return chai.request(app).get('/api/folders/NOT_VALID')
        .then(res =>{
          expect(res).to.have.status(400);
          expect(res).to.be.an('object');
          expect(res.body.message).to.equal('MUST request an existing folder');
        });
    });
    it('should give a 404 error for an id that does not exist', function(){
      return chai.request(app).get('/api/folders/DOESNOTEXIST')
        .then(res=>{
          expect(res).to.have.status(404);
          expect(res).to.be.an('object');
          expect(res.body.message).to.equal('Not Found');

        });
    });
  });
  describe('POST /api/folders ', function(){
    it('should create and return a new folder when provided valid data', function(){
      const newFolder ={
        name : 'Clown Photos'
      };
      
      let res;

      return chai.request(app)
        .post('/api/folders/')
        .send(newFolder)
        .then(function(_res){
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id','name','createdAt','updatedAt');
          
          return Folder.findById(res.body.id);
        })
        .then(function(data){
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);

          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);    
        });
    });
    it('should return `no name` error', function(){
      const newFolder = {};
      return chai.request(app)
        .post('/api/folders/')
        .send(newFolder)
        .then(function(res){
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });  
    it('should not allow creation of a duplicate folder name', function(){

      return  Folder.findOne()
        .then( function(data){
          let newFolder = {
            name : data.name
          };
          return chai.request(app)
            .post('/api/folders')
            .send(newFolder);
        })    
        .then(function(res){
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('The folder name already exists');    
        });
    });
  });
  describe( 'PUT /api/folders/:id', function(){ 
    it('should return the correct folder', function(){
      let updateFolder ={
        name : 'Square Circles'
      };
      let data;
      return Folder.findOne()
        .then(_data =>{
          data = _data;
          return chai.request(app)
            .put(`/api/folders/${data.id}`)
            .send(updateFolder);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res).to.be.an('object');
          expect(res.body).to.have
            .keys('id', 'name','createdAt','updatedAt');
    
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(updateFolder.name);
          expect(new Date(res.body.createdAt))
            .to.eql(data.createdAt);
        });
    });
    it('should throw error when there is no update name', function(){
      const updateFolder ={};
      return Folder.findOne()
        .then(data =>{
          return chai.request(app)
            .put(`/api/folders/${data.id}`)
            .send(updateFolder);
        })
        .then( function(res){
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('Missing `name` in request body');          
        });    
    });
    it('should not allow creation of a duplicate folder name', function(){
      let id;
      let testFolder ={
        name: 'Orchid Fruit'
      };
      return  Folder.findOne()
        .then(function(data){
          id = data.id;
          return chai.request(app)
            .post('/api/folders/')
            .send(testFolder);
        })  
        .then(function(){
          return chai.request(app)
            .put(`/api/folders/${id}`)
            .send(testFolder);
        })
        .then(function(res){
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('The folder name already exists');    
        });
    });
    it('should throw error when passed an invalid id', function(){
      let  updateFolder ={
        name : 'Book reviews'
      };
      return chai.request(app).put('/api/folders/NOT_VALID')
        .send(updateFolder)
        .then(res =>{
          expect(res).to.have.status(400);
          expect(res).to.be.an('object');
          expect(res.body.message).to.equal('MUST request an existing folder');
        });
    });
    it('should give a 404 error for an id that does not exist', function(){
      let updateFolder = {
        name : ' Phones are silcon bricks'
      };
      return chai.request(app).put('/api/folders/DOESNOTEXIST')
        .send(updateFolder)
        .then(res=>{
          expect(res).to.have.status(404);
          expect(res).to.be.an('object');
          expect(res.body.message).to.equal('Not Found');

        });
    });
  });  
  describe(' DEL /api/folders/:id', function(){
    it('should delete a folder', function(){
      return Folder.findOne()
        .then(function(data){
          return  chai.request(app).delete(`/api/folders/${data.id}`);
        })
        .then(function(res){
          expect(res).to.have.status(204);
        });
    });
  });
}); 



