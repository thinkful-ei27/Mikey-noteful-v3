'use strict';
const express = require('express');

const Tag  = require('../models/tag');
const router = express.Router();

const mongoose =require('mongoose');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  
  
  
  Tag.find()
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
    const err = new Error('MUST post to  valid  folder');
    err.status = 400;
    return next(err);
  } 
  
  Tag.findById(id)
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
  const newTag = {
    name
  };

  if(!newTag.name){
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  Tag.create(newTag)
    .then(results => {
      if(results){
        res.location(`${req.originalUrl}/${results.id}`).status(201).json(results);
        // res.json(results);
      }
      else next();
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The Tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const {name } = req.body;
  const id =req.params.id;
  const updateTag ={
    name
  };
  const updateId ={ _id : id };
  if(!updateTag.name){
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  let valid =  mongoose.Types.ObjectId.isValid(id);
  
  if(!valid){
    const err = new Error('MUST post to  valid  folder');
    err.status = 400;
    return next(err);
  } 
  
  Tag.findByIdAndUpdate(updateId, updateTag, {new : true})
    .then(results => {
      if(results){
        res.json(results);}
      else next();
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The Tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  
  Tag.findByIdAndRemove(id)
    .then(()=> res.sendStatus(204))
    .catch( err => {
      console.error( `ERROR: ${err.message}`);
      next(err);
    });
});

module.exports = router;
