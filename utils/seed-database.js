'use strict';

console.log('hi');

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tag');

const { notes, folders, tags } = require('../db/data');

mongoose.connect(MONGODB_URI, { useNewUrlParser: true } )
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() =>{ 
    return Promise.all([  
      Folder.insertMany(folders),
      Folder.createIndexes(),
      Note.insertMany(notes),
      Tag.insertMany(tags),
      Tag.createIndexes()]);
  })
  .then( results => {
    console.info( results);
  })
  .then(()=> mongoose.disconnect())
  .catch(err => {
    console.log(err);
  });