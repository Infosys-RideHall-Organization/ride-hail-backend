import { Router } from 'express';
import { getAllCampuses, createCampus } from '../controllers/campus.controller';

const campusRouter = Router();

campusRouter.get('/', getAllCampuses);
campusRouter.post('/', createCampus);

export default campusRouter;
