const {Product} = require('../models/product.model');
const {Category} = require('../models/category.model');
const mongoose = require('mongoose');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const FILE_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpg' : 'jpg',
    'image/jpeg' : 'jpeg',
    'image/gif' : 'gif',
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValidFile = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');
        if(isValidFile)
        {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.split(' ').join('');
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
const uploadOptions = multer({ storage: storage })
router.get(`/allProducts`, async (req, res) =>{
    try {
        let filter = {};
        if(req.query.categories)
        {
            filter = {category : req.query.categories.split(',')}
        }
        const productList = await Product.find(filter).populate('category');
        if(!productList) {
            res.status(500).json({success: false})
        } 
        res.status(200).send({success : true , productList});
    } catch (error) {
        res.status(500).json(error)
    }
})
router.post(`/addProduct`, uploadOptions.single('image'), async (req, res) => {
// router.post(`/addProduct`, async (req, res) => {
        const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');
    const file = req.file;
    if (!file) return res.status(400).send('No image Uploaded!');
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            //image: req.body.image, // "http://localhost:3000/public/upload/image-2323232"
            image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        });
        product = await product.save();
    
        if (!product) return res.status(500).send('The product cannot be created');
    
        res.json({
            success : true,
            message : "the product created successfully!",
            product : product
        });

});
router.put(`/updateProduct/:productId`, uploadOptions.single('image') , async(req, res) =>{
    try {
        if(!mongoose.isValidObjectId(req.params.productId))
        {
            return res.status(400).json({success : false , message : "Invalid productID!"})
        }
        let category = await Category.findById(req.body.category)
        if(!category) 
        {
            return res.status(400).json({success : false , message : "Invalid categoryID!"})
        }
        const productExists = await Product.findById(req.params.productId);
        if(!productExists) return res.status(400).json({success : false , message : "Invalid productID!"})
        const file = req.file;
        console.log(file);
        let imagePath;
        if(file)
        {
            const fileName = req.file.filename;
            const basePath = `${req.protocol}://${req.get('host')}/public/uploads`;
            imagePath = `${basePath}/${fileName}`;
        } 
        else {
            imagePath = productExists.image;
        }
        let product = await Product.findByIdAndUpdate(req.params.productId , {
            name: req.body.name,
            description : req.body.description,
            richDescription : req.body.richDescription,
            image: imagePath,
            images : req.body.images,
            brand : req.body.brand,
            price : req.body.price,
            category : req.body.category,
            countInStock: req.body.countInStock,
            rating : req.body.rating,
            numReviews : req.body.numReviews,
            isFeatured : req.body.isFeatured
        } , {new : true})
        if(!product) return res.status(500).json({success : false , message : 'the product cannot be updated!'});
        return res.json({
            success : true,
            message : "the product updated successfully!",
            product
        })
    } catch (error) {
        res.status(400).json(error)
    }
})
router.get(`/productDetails/:productId`, async (req, res) =>{
    try {
        const productDetails = await Product.findById(req.params.productId).populate('category');
        if(!productDetails) {
            res.status(500).json({success: false , message : "the product doesn't exists!"})
        } 
        res.status(200).send({success : true , productDetails});
    } catch (error) {
        res.status(400).json(error)
    }
})
router.delete('/deleteProduct/:productId' , async(req,res) => {
    Product.findByIdAndRemove(req.params.productId).then((product) => {
        if(product)
        {
            return res.status(201).json({
                success : true,
                message : "the product deleted successfully!"
            })
        } else {
            return res.status(404).json({
                success : false,
                message : "product not found!"
            })
        }
    }).catch(error => {
        return res.status(400).json({success : false , error})
    })
})
router.get(`/get/count`, async (req, res) =>{
    try {
        let productCount = await Product.countDocuments({});
        if(!productCount) {
            res.status(500).json({success: false})
        } 
        res.status(200).send({productCount});
    } catch (error) {
        res.status(500).json(error)
    }
})
router.get(`/get/featured/:count`, async (req, res) =>{
    try {
        const count = req.params.count ? req.params.count : 0;
        let product = await Product.find({isFeatured : true}).limit(+count)
        if(!product) {
            res.status(500).json({success: false})
        } 
        res.status(200).send(product);
    } catch (error) {
        res.status(500).json(error)
    }
})
router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    );

    if (!product) return res.status(500).send('the gallery cannot be updated!');

    res.send(product);
});
module.exports =router;