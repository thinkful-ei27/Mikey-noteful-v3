'use strict';

const mongoose =require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

// mongoose.connect( MONGODB_URI ,{ useNewUrlParser: true })
//   .then(() => { 
//     const searchTerm = 'lady Gaga';
//     let filter = {};
//     if (searchTerm){
//       filter.title = { $regex : searchTerm, $options : 'i' };
//     }
//     return Note.find(filter).sort( {updatedAt :  'desc'});
//   })
//   .then( results => console.log(results[0]))
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch( err => {
//     console.error( `ERROR: ${err.message}`);
//     console.error(err);
//   });

// mongoose.connect( `${MONGODB_URI}` , { useNewUrlParser: true })
//   .then(() => { 
//     const searchId = '111111111111111111111101';
  
    
//     return Note.findById(searchId);
//   })
//   .then( results => console.log(results))
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch( err => {
//     console.error( `ERROR: ${err.message}`);
//     console.error(err);
//   });

// mongoose.connect( `${MONGODB_URI}` , { useNewUrlParser: true })
//   .then(() => { 
//     const newNote = {};
//     newNote.title = 'poodles';
//     newNote.content = 'are lazy';

//     return Note.create(newNote);
//   })
//   .then( results => console.log(results))
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch( err => {
//     console.error( `ERROR: ${err.message}`);
//     console.error(err);
//   });

// mongoose.connect( `${MONGODB_URI}` , { useNewUrlParser: true })
//   .then(() => { 
//     const searchId ={_id : '111111111111111111111101'};
//     const updateObj = { title :  'Dont forget gloves its cold'};
  
    
//     return Note.findByIdAndUpdate(searchId, updateObj, {new : true, upsert :true });
//   })
//   .then( results => console.log(results))
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch( err => {
//     console.error( `ERROR: ${err.message}`);
//     console.error(err);
//   });

mongoose.connect( `${MONGODB_URI}` , { useNewUrlParser: true })
  .then(() => { 
    const searchId = '111111111111111111111101';
  
    
    return Note.findByIdAndRemove(searchId);
  })
  .then( results => console.log(results))
  .then(() => {
    return mongoose.disconnect();
  })
  .catch( err => {
    console.error( `ERROR: ${err.message}`);
    console.error(err);
  });
