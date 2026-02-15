import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

connectDB();

const PORT = process.env.PORT || 5000;

// 404 Handler - must be after all other routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        statusCode: 404,
        message: `Route not found: ${req.method} ${req.path}`,
        error: 'Not Found'
    });
});

// Error Handler
app.use((err: any, req: any, res: any, next: any) => {
    console.error('Error:', err);
    res.status(err.statusCode || 500).json({
        success: false,
        statusCode: err.statusCode || 500,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
});

app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`);
    console.log('Routes registered');
});

