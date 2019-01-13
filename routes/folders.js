'use strict';
const express = require('express');
const mongoose =require('mongoose');

const Folder  = require('../models/folder');
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {


  Folder.find()
    .sort( {name : 'asc'})
    .then(results => {
      if(results){
        res.json(results);}
      else next();
    })
    .catch( err => {
      console.error( `ERROR: ${err.message}`);
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  let valid =  mongoose.Types.ObjectId.isValid(id);
  
  if(!valid){
    const err = new Error('MUST request an existing folder');
    err.status = 400;
    return next(err);
  } 
  
  Folder.findById(id)
    .then(results => {
      if(results){
        res.json(results);}
      else next();
    })
    .catch( err => {
      console.error( `ERROR: ${err.message}`);
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  const { name } = req.body;
  const newFolder = {
    name
  };

  if(!newFolder.name){
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  Folder.create(newFolder)
    .then(results => {
      if(results){
        res.location(`${req.originalUrl}/${results.id}`).status(201).json(results);
      }
      else next();
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const {name } = req.body;
  const id =req.params.id;
  const updateFolder ={
    name
  };
  const updateId ={ _id : id };
  if(!updateFolder.name){
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  Folder.findByIdAndUpdate(updateId, updateFolder, {new : true})
    .then(results => {
      if(results){
        res.json(results);}
      else next();
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  
  Folder.findByIdAndRemove(id)
    .then(()=> res.sendStatus(204))
    .catch( err => {
      console.error( `ERROR: ${err.message}`);
      next(err);
    });
});

module.exports = router;
