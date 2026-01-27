import mongoose from 'mongoose';
import { MONGO_URI } from './env.js';

const connectDB = async (): Promise<void> => {
    const uri = MONGO_URI as string | undefined;
    if (!uri) {
        console.warn('MONGO_URI not set — skipping MongoDB connection (development mode).');
        return;
    }

    try{
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
    }catch(error){
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }   
};
 
export default connectDB;