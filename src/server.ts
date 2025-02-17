import app from './app.js';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file
const port = process.env.PORT || 3545;

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});