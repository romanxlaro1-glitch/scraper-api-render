const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Load Swagger
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/viu', require('./routes/viu'));
app.use('/api/naxa', require('./routes/naxa'));
app.use('/api/deepseek', require('./routes/deepseek'));
app.use('/api/chatgpt', require('./routes/chatgpt'));
app.use('/api/wink', require('./routes/wink'));
app.use('/api/alight', require('./routes/alight'));
app.use('/api/kiyora', require('./routes/kiyora'));

app.get('/', (req, res) => {
  res.json({ message: "Scraper API is Running!", docs: "/docs" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
