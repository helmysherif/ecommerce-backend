const {User} = require('../models/user.model');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
router.get(`/allUsers`, async (req, res) =>{
    const usersList = await User.find().select('-passwordHash');
    if(!usersList) {
        res.status(500).json({success: false})
    } 
    res.send(usersList);
})
router.post(`/addUser`, async(req, res) =>{
    try {
        let emailExists = await User.findOne({email : req.body.email});
        if(emailExists) return res.status(500).send('email already exists!')
        let user = new User({
            name : req.body.name,
            email : req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password , 10),
            phone: req.body.phone,
            street: req.body.street,
            apartment: req.body.apartment,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            isAdmin: req.body.isAdmin,
        })
        user = await user.save()
        if(!user)
        {
            return res.status(400).send({success : false , message : 'the user cannot be created!'});
        } else {
            res.json({
                success : true,
                message : "the user created successfully!",
                user
            })
        }
    } catch (error) {
        res.status(400).json(error)
    }
})
router.get(`/userDetails/:userId`, async (req, res) =>{
    try {
        const userDetails = await User.findById(req.params.userId).select('-passwordHash');
        if(!userDetails) {
            res.status(500).json({success: false , message : "the user doesn't exists!"})
        } 
        res.status(200).send({success : true , userDetails});
    } catch (error) {
        res.status(400).json(error)
    }
})
router.put(`/updateUser/:userId`, async(req, res) =>{
    try {
        let userExists = await User.findById(req.params.userId);
        let newPassword;
        if(req.body.password)
        {
            newPassword = bcrypt.hashSync(req.body.password , 10);
        } else {
            newPassword = userExists.passwordHash;
        }
        let user = await User.findByIdAndUpdate(req.params.userId , {
            name : req.body.name,
            email : req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            street: req.body.street,
            apartment: req.body.apartment,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            isAdmin: req.body.isAdmin,
        },{new : true})
        user = await user.save()
        if(!user)
        {
            return res.status(400).send({success : false , message : 'the user cannot be updated!'});
        } else {
            res.json({
                success : true,
                message : "the user updated successfully!",
                user
            })
        }
    } catch (error) {
        res.status(400).json(error)
    }
})
router.delete('/deleteUser/:userId' , async(req,res) => {
    User.findByIdAndRemove(req.params.userId).then((user) => {
        if(user)
        {
            return res.status(201).json({
                success : true,
                message : "the user deleted successfully!"
            })
        } else {
            return res.status(404).json({
                success : false,
                message : "user not found!"
            })
        }
    }).catch(error => {
        return res.status(400).json({success : false , error})
    })
})
router.post('/login' , async(req,res) => {
    let user = await User.findOne({email : req.body.email});
    if(!user)
    {
        return res.status(400).send("email doesn't exists")
    } else {
        const secret = process.env.secret
        if(user && bcrypt.compareSync(req.body.password , user.passwordHash))
        {
            const token = jwt.sign({
                userID : user.id,
                isAdmin : user.isAdmin,
                email : user.email
            } , secret , {expiresIn : '1d'});
            return res.status(200).json({success : true , token})
        } else {
            return res.status(400).send("incorrect password!")
        }
    }
})
router.get(`/get/count`, async (req, res) =>{
    try {
        let userCount = await User.countDocuments({});
        if(!userCount) {
            res.status(500).json({success: false})
        } 
        res.status(200).send({userCount});
    } catch (error) {
        res.status(500).json(error)
    }
})
module.exports =router;