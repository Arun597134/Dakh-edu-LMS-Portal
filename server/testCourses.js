import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Course from './models/Course.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const run = async () => {
    await connectDB();
    const courses = await Course.find();
    fs.writeFileSync('courses2.json', JSON.stringify(courses, null, 2), 'utf-8');
    process.exit(0);
}
run();
