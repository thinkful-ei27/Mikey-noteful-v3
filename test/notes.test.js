'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');


const app = require('../server');

const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tag');

const { notes, folders, tags } = require('../db/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful Api resource', function(){

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
  
  beforeEach(function () {
    return  Promise.all( 
      [Folder.insertMany(folders),
        Folder.createIndexes(),
        Tag.insertMany(tags),
        Tag.createIndexes(),
        Note.insertMany(notes)]);
  });
  
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
  
  after(function () {
    return mongoose.disconnect();
  });

  describe.skip( 'GET /api/notes endpoint', function(){
    it(' should return all existing notes', function(){
      return Promise.all([
        Note.find(),
        chai.request(app).get('/api/notes')
      ])
        .then(([data, res])=> {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });
  });

  describe.skip( 'GET /api/notes/:id', function(){
    it('should return the correct note', function(){
      let data;

      return Note.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'folderId', 'updatedAt');
        
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);

        });
        
    });

  });

  describe.skip('POST /api/notes', function () {
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
        'folderId' : '111111111111111111111101'
      };

      let res;
      // 1) First, call the API
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
         
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'folderId', 'createdAt', 'updatedAt');
          // 2) then call the database
          return Note.findById(res.body.id);
        })
        // 3) then compare the API response to the database results
        .then(data => {
          console.log(data);
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);

          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe('DELETE api/notes/:id' , function(){

    console.log('function start delete');
    it('should find a note and delete it by id', function(){
      console.log('fucntion it ran');
      let note;
      // find a random note
      return Note.findOne()
        .then((_note) =>{
          note= _note;
          // set it ouside scope, then make a delete http request to app by that id
          return chai.request(app).delete(`/api/notes/${note.id}`);
        })
        // check to see if that note was deleted 
        .then(res => {
          expect(res).to.have.status(204);
          return Note.findById(note.id);
        })
        .then(_note => {
          expect(_note).to.be.null;
        });
    });
  });


  describe('PUT /api/notes/:id', function(){

    it('should take update data and insert it into the right id', function(){
      const updateData = {
        title: 'dogs',
        content: 'they bark a lot and are lazy',
        folderId : '111111111111111111111101'
      };
      return Note.findOne()
        .then(data => {
      
          updateData.id = data.id;
        
          return chai.request(app)
            .put(`/api/notes/${data.id}`)
            .send(updateData);
        })
        .then((res) => {
          expect(res).to.have.status(200);
        
          return Note.findById(updateData.id);

        })
        .then((note)=> {

          expect(note).to.be.a('object');
          expect(note.title).to.equal(updateData.title);
          expect(note.content).to.equal(updateData.content);
        });
    });

  });

  

});