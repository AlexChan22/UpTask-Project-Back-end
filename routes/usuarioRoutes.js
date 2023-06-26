import express from 'express';

const router = express.Router(); 

import { registrar, autenticar,confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil} from '../controllers/usuarioController.js'
import checkAuth from '../middleware/checkAuth.js'
// creacion, registro y confirmacion de usuarios
router.post('/', registrar); 
router.post('/login', autenticar);
router.get('/confirmar/:token', confirmar); // routing dinamico
router.post('/olvide-password', olvidePassword); // routing dinamico
// router.get('/olvide-password/:token', comprobarToken); // routing dinamico
// router.post('/olvide-password/:token', nuevoPassword); // routing dinamico

router.route('/olvide-password/:token')
    .get(comprobarToken)
    .post(nuevoPassword); 

router.get('/perfil', checkAuth, perfil);

export default router; 