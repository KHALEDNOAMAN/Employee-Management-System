require('dotenv').config();
const app = require('./src/app');
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`EMS API running on port ${PORT}`));
