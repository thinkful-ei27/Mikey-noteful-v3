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
          expect(res.body.message).to.equal('MUST request an existing tag');
        });
    });
  }); 
});
