const {Category} = require('../models/category.model');
const express = require('express');
const router = express.Router();
router.get(`/allCategories`, async (req, res) =>{
    try {
        const categoryList = await Category.find();
        if(!categoryList) {
            res.status(500).json({success: false})
        } 
        res.status(200).send({success : true , categoryList});
    } catch (error) {
        res.status(500).json(error)
    }
})
router.get(`/categoryDetails/:categoryId`, async (req, res) =>{
    try {
        const categoryDetails = await Category.findById(req.params.categoryId);
        if(!categoryDetails) {
            res.status(500).json({success: false , message : "the category doesn't exists!"})
        } 
        res.status(200).send({success : true , categoryDetails});
    } catch (error) {
        res.status(400).json(error)
    }
})
router.post(`/addCategory`, async(req, res) =>{
    try {
        let category = new Category({
            name : req.body.name,
            icon : req.body.icon,
            color: req.body.color
        })
        category = await category.save()
        if(!category)
        {
            return res.status(400).send({success : false , message : 'the category cannot be created!'});
        } else {
            res.json({
                success : true,
                message : "the category created successfully!",
                category
            })
        }
    } catch (error) {
        res.status(400).json(error)
    }
})
router.put(`/updateCategory/:categoryId`, async(req, res) =>{
    try {
        const category = await Category.findByIdAndUpdate(req.params.categoryId , {
            name : req.body.name,
            icon : req.body.icon,
            color: req.body.color
        } , {new : true})
        if(!category)
        {
            return res.status(400).send({success : false , message : 'the category cannot be updated!'});
        } else {
            res.json({
                success : true,
                message : "the category updated successfully!",
                category
            })
        }
    } catch (error) {
        res.status(400).json(error)
    }
})
router.delete('/deleteCategory/:categoryId' , async(req,res) => {
    Category.findByIdAndRemove(req.params.categoryId).then((category) => {
        if(category)
        {
            return res.status(201).json({
                success : true,
                message : "the category deleted successfully!"
            })
        } else {
            return res.status(404).json({
                success : false,
                message : "category not found!"
            })
        }
    }).catch(error => {
        return res.status(400).json({success : false , error})
    })
})
router.get(`/get/count`, async (req, res) =>{
    try {
        let categoryCount = await Category.countDocuments({});
        if(!categoryCount) {
            res.status(500).json({success: false})
        } 
        res.status(200).send({categoryCount});
    } catch (error) {
        res.status(500).json(error)
    }
})
module.exports =router;