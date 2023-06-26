import express from "express";
import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import {emailRegitro, emailOlvidePassword} from '../helpers/email.js';


const registrar = async (req, res) => {
    // Evitar registros duplicados 
    const {email} = req.body; 

    const existeUsuario = await Usuario.findOne({ email: email}); 

    if(existeUsuario) {
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({msg: error.message})
    }

    try {
        const usuario = new Usuario(req.body); 
        usuario.token = generarId(); 
        const usuarioAlmacenado = await usuario.save(); 

        // Enviar el email de confirmacion
        emailRegitro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        // res.json(usuarioAlmacenado);
        res.json({msg: 'Usuario creado correctamente, Revisa tu Email para confirmar tu cuenta'})
    } catch (error) {
        console.log(error); 
    }
}

const autenticar = async (req, res) => {

    const { email, password} = req.body; 
    const usuario = await Usuario.findOne({email}); 
    if(!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({msg: error.message})
    }
    // Comprobar si el usuario existe
    // Comprobar si el usuario esta confirmado 
    if(!usuario.confirmado) {
        const error = new Error("Tu cuenta no ha sido confirmada");
        return res.status(403).json({msg: error.message})
    }

    // Comprobar su password

    if (await usuario.comprobarPassword(password)){
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id)

        })
    } else {
        const error = new Error('El passsword es incorrecto')
        return res.status(403).json({msg: error.message}); 
    }
};
const confirmar = async (req, res) => {
    const { token } = req.params; 
    const usuarioConfirmar = await Usuario.findOne({token});
    console.log(usuarioConfirmar);
    if (!usuarioConfirmar) {
        const error = new Error('Token no valido')
        return res.status(403).json({msg: error.message});
    }
   
    try {
        usuarioConfirmar.confirmado = true; 
        usuarioConfirmar.token = ''
        await usuarioConfirmar.save(); // guardando en mongodb
        return res.json({msg: 'Usuario Confirmado correctamente'})
  
    } catch (error) {
        console.log(error); 
    }
}

const olvidePassword = async (req, res) => {
    const { email } = req.body; 
    const usuario = await Usuario.findOne({email}); 
    if(!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({msg: error.message})
    }

    try {
        usuario.token = generarId();
        await usuario.save();

        // Enviar el email
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })
        res.json({msg: 'Hemos enviado token'})
    } catch (error) {
        console.log(error);
    }
}

const comprobarToken = async (req, res) => {
    const {token} = req.params; 
    const tokenValido = await Usuario.findOne({token})

    if (tokenValido) {
        res.json({msg: 'token valido, usuario existe'})
    } else {
        const error = new Error("Token no valido");
        return res.status(404).json({msg: error.message})
    }
}

const nuevoPassword = async (req, res) => {
    const {token} = req.params; 
    const {password} = req.body; 

    const usuario = await Usuario.findOne({token})

    if (usuario) {
        usuario.password = password;
        usuario.token = ''
        await usuario.save(); 
        res.json({msg: 'Password Modificado Correctamente'})
    } else {
        const error = new Error("Token no valido");
        return res.status(404).json({msg: error.message})
    }
}

const perfil = async (req, res) => {
    const { usuario } = req;
    res.json(usuario)
}

export {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil,

}