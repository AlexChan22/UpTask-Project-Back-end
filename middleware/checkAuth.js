import jwt from 'jsonwebtoken'; 
import Usuario from '../models/Usuario.js';

const checkAuth = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

        let token;
        try {
            token = req.headers.authorization.split(' ')[1];
            // decode el jwt para obtener el id
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // - es un flag para omitir esos datos
            req.usuario = await Usuario.findById(decoded.id).select("-password -confirmado -token -createdAt -updatedAt -__v");
            
            return next(); 
        } catch (error) {
            return res.status(404).json({msg: 'Hubo un error'})
        }
    }

    if (!token) {
        const error = new Error('Token no definido o valido')
        return res.status(401).json({msg: error.message})
    }


    next(); 
};


export default checkAuth; 