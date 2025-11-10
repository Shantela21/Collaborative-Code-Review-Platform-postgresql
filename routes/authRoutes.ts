import { get } from "http";
import { createNewUser,  login} from "../controllers/authController";
import { Router } from "express";

const router = Router()

router.post('/register', createNewUser)
router.post('/login', login)




export default router