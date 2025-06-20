import { Request, Response } from 'express';
import { Campus } from '../db/schema/campus.schema';

export const getAllCampuses = async (req: Request, res: Response) => {
    try {
        const campuses = await Campus.find();
        res.status(200).json(
            {
                success: true,
                message: 'Fetched campuses successfully',
                campuses
            });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch campuses' });
    }
};

export const createCampus = async (req: Request, res: Response) => {
    const { name, latitude, longitude } = req.body;

    if (!name || latitude === undefined || longitude === undefined) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
    }

    try {
        const existingCampus = await Campus.findOne({
            name,
            latitude,
            longitude
        });

        if (existingCampus) {
            res.status(400).json({
                success: false,
                message: 'Campus with the same name and location already exists'
            });
            return;
        }

        // Create new campus
        const newCampus = new Campus({ name, latitude, longitude });
        await newCampus.save();

         res.status(201).json({
            success: true,
            message: 'Campus created successfully.',
            newCampus
        });
    } catch (err) {
        console.error('Error creating campus:', err);
         res.status(500).json({
            success: false,
            error: 'Failed to create campus'
        });
    }
};
