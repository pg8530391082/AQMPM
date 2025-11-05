const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store latest sensor data
let sensorData = {
  pm25: 0,
  pm10: 0,
  co: 0,
  voc: 0,
  so2: 0,
  no2: 0,
  nh3: 0,
  overall: 0,
  temperature: 0,
  humidity: 0,
  timestamp: Date.now(),
  status: 'Waiting for sensor data...'
};

// === POST route for data from Python/ESP ===
app.post('/api/data', (req, res) => {
  try {
    const data = req.body;

    // Normalize field names coming from your Arduino/Python JSON
    sensorData = {
      pm25: data.AQI_PM25 || 0,
      pm10: data.AQI_PM10 || 0,
      co: data.AQI_CO || 0,
      voc: data.AQI_VOC || 0,
      so2: data.AQI_SO2 || 0,
      no2: data.AQI_NO2 || 0,
      nh3: data.AQI_NH3 || 0,
      overall: data.Overall_AQI || 0,
      temperature: data.Temperature || 0,
      humidity: data.Humidity || 0,
      timestamp: Date.now(),
      status: 'Live Data'
    };

    console.log('✅ Data received:', sensorData);
    res.json({ status: 'success', message: 'Data received by AQMPM' });
  } catch (error) {
    console.error('❌ Error processing data:', error);
    res.status(400).json({ status: 'error', message: 'Invalid data' });
  }
});

// === GET route for frontend to fetch latest data ===
app.get('/api/data', (req, res) => {
  res.json(sensorData);
});

// === Serve the main page ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === Health check endpoint ===
app.get('/health', (req, res) => {
  res.json({
    status: 'AQMPM Server is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AQMPM Server started on port ${PORT}`);
  console.log(`📡 Ready to receive sensor data...`);
});
