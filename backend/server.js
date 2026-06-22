// Importing required packages
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Initialize the express app
const app = express();
const PORT = 3000;

// Path to our data file
const dataFilePath = path.join(__dirname, 'data.json');

// Middleware - allows frontend to talk to backend
app.use(cors());
app.use(express.json());

// Helper function to read interns from data.json
function readInterns() {
  const fileData = fs.readFileSync(dataFilePath, 'utf-8');
  return JSON.parse(fileData);
}

// Helper function to save interns to data.json
function saveInterns(interns) {
  fs.writeFileSync(dataFilePath, JSON.stringify(interns, null, 2));
}

// GET - Fetch all interns
app.get('/api/interns', (req, res) => {
  try {
    const interns = readInterns();
    res.status(200).json(interns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interns' });
  }
});

// POST - Add a new intern
app.post('/api/interns', (req, res) => {
  try {
    const interns = readInterns();
    const newIntern = {
      id: Date.now(), // unique id using timestamp
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      batch: req.body.batch
    };
    interns.push(newIntern);
    saveInterns(interns);
    res.status(201).json(newIntern);
  } catch (error) {
    res.status(500).json({ message: 'Error adding intern' });
  }
});

// PUT - Update an existing intern
app.put('/api/interns/:id', (req, res) => {
  try {
    const interns = readInterns();
    const internId = parseInt(req.params.id);
    const internIndex = interns.findIndex(intern => intern.id === internId);

    if (internIndex === -1) {
      return res.status(404).json({ message: 'Intern not found' });
    }

    // Update the intern details
    interns[internIndex] = {
      id: internId,
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      batch: req.body.batch
    };

    saveInterns(interns);
    res.status(200).json(interns[internIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating intern' });
  }
});

// DELETE - Remove an intern
app.delete('/api/interns/:id', (req, res) => {
  try {
    const interns = readInterns();
    const internId = parseInt(req.params.id);
    const updatedInterns = interns.filter(intern => intern.id !== internId);

    if (updatedInterns.length === interns.length) {
      return res.status(404).json({ message: 'Intern not found' });
    }

    saveInterns(updatedInterns);
    res.status(200).json({ message: 'Intern deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting intern' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});