'use strict';

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schena({
  title: { type: String, required: true },
  content : String
});

// Add `createdAt` and `updatedAt` fields
noteSchema.set('timestamps' , true);

module.exports = mongoose.model('Note', noteSchema);