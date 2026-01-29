import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import { Router } from 'express';

connectDB();

const PORT = process.env.PORT || 5000 ;

const router = Router();

router.get("/health", ( req, res ) => res.send({
    message: "Healthy"
}) );

app.use(router);

app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`);
});

