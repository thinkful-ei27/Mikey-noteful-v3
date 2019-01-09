'use strict';

const express = require('express');

const Note = require('../models/note');
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  
  const { searchTerm } =req.query;
  let regex;
  if(searchTerm){
    regex = new RegExp(searchTerm , 'i');
  }
  Note.find({$or : [{},{title: regex}, {content: regex}]})
    .sort( {updatedAt :  'desc'})
    .then( results => res.json(results))
    .catch( err => {
      console.error( `ERROR: ${err.message}`);
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  
  Note.findById(id)
    .then( results => res.json(results))
    .catch( err => {
      console.error( `ERROR: ${err.message}`);
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  const { title, content } = req.body;
  const newNote = {
    title,
    content
  };

  if(!newNote.title){
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  Note.create(newNote)
    .then( results => res.json(results))
    .catch( err => {
      console.error( `ERROR: ${err.message}`);
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const {title, content } = req.body;
  const id =req.params.id;
  const updateNote ={
    title,
    content
  };
  const updateId ={ _id : id };
  if(!updateNote.title){
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  Note.findByIdAndUpdate(updateId, updateNote, {new : true})
    .then( results => res.json(results))
    .catch( err => {
      console.error( `ERROR: ${err.message}`);
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  
  Note.findByIdAndRemove(id)
    .then(()=> res.sendStatus(204))
    .catch( err => {
      console.error( `ERROR: ${err.message}`);
      next(err);
    });
});

module.exports = router;
