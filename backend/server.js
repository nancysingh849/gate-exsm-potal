require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const portalRoutes = require('./routes/portal');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware with 50mb payload limits for multimodal image uploads
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gate_portal';
mongoose.connect(MONGO_URI)
  .then(() => console.log(' Connected to MongoDB Successfully!'))
  .catch((err) => console.error(' MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portal', portalRoutes);

app.get('/', (req, res) => {
  res.send('GATE Exam Preparation Web Portal API is live.');
});

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
