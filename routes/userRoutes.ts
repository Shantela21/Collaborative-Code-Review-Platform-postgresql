import { deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/userController";
import { auth, admin } from "../middleware/auth";
import Router from "express";

const router = Router();

router.get('/', auth, admin, getAllUsers);
router.get('/:id', auth, getUserById);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, admin, deleteUser);

export default router;