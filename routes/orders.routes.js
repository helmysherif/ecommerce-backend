const {Order} = require('../models/order.model');
const {OrderItem} = require('../models/order-item');
const express = require('express');
const router = express.Router();
router.get(`/allOrders`, async (req, res) =>{
    const ordersList = await Order.find().populate('user' , 'name email').sort({'dateCreated' : -1});
    if(!ordersList) {
        res.status(500).json({success: false})
    } 
    res.send(ordersList);
})
router.get(`/orderDetails/:orderId`, async (req, res) =>{
    const orderDetails = await Order.findById(req.params.orderId)
    .populate('user' , 'name email phone')
    .populate({
        path : 'orderItems' , populate : {
            path : 'product' , populate : 'category'
        }
    });
    if(!orderDetails) {
        res.status(500).json({success: false})
    } 
    res.send(orderDetails);
})
router.post(`/addOrder`, async(req, res) =>{
    try {
        const orderItemsIds = Promise.all(req.body.orderItems.map(async orderitem => {
            let newOrderItem = new OrderItem({
                quantity : orderitem.quantity,
                product : orderitem.product
            })
            newOrderItem = await newOrderItem.save()
            return newOrderItem._id;
        }))
        const orderItemsIdsResolved = await orderItemsIds;
        const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
            const orderItem = await OrderItem.findById(orderItemId).populate('product' , 'price')
            const totalPrice = orderItem.product.price * orderItem.quantity;
            return totalPrice;
        }))
        const totalPrice = totalPrices.reduce((a,b) => a + b , 0);
        let order = new Order({
            orderItems:orderItemsIdsResolved,
            shippingAddress1:req.body.shippingAddress1,
            shippingAddress2:req.body.shippingAddress2,
            city:req.body.city,
            zip:req.body.zip,
            country:req.body.country,
            phone:req.body.phone,
            status:req.body.status,
            totalPrice:totalPrice,
            user:req.body.user
        })
        order = await order.save()
        if(!order)
        {
            return res.status(400).send({success : false , message : 'the order cannot be created!'});
        } else {
            res.json({
                success : true,
                message : "the order created successfully!",
                order
            })
        }
    } catch (error) {
        res.status(400).json(error)
    }
})
router.put(`/updateOrder/:orderId`, async(req, res) =>{
    try {
        const order = await Order.findByIdAndUpdate(req.params.orderId , {
            status : req.body.status
        } , {new : true})
        if(!order)
        {
            return res.status(400).send({success : false , message : 'the order not Found!'});
        } else {
            res.json({
                success : true,
                message : "the order updated successfully!",
                order
            })
        }
    } catch (error) {
        res.status(400).json(error)
    }
})
router.delete('/deleteOrder/:orderId' , async(req,res) => {
    Order.findByIdAndRemove(req.params.orderId).then(async (order) => {
        if(order)
        {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(201).json({
                success : true,
                message : "the order deleted successfully!"
            })
        } else {
            return res.status(404).json({
                success : false,
                message : "order not found!"
            })
        }
    }).catch(error => {
        return res.status(400).json({success : false , error})
    })
})
router.get(`/get/totalSales`, async (req, res) =>{
    const totalSales = await Order.aggregate([
        {$group : {_id : null , totalSales : {$sum : '$totalPrice'}}}
    ])
    if(!totalSales) {
        res.status(500).json({success: false})
    } 
    res.send({totalSales : totalSales.pop().totalSales});
})
router.get(`/get/count`, async (req, res) =>{
    try {
        let ordersCount = await Order.countDocuments({});
        if(!ordersCount) {
            res.status(500).json({success: false})
        } 
        res.status(200).send({ordersCount});
    } catch (error) {
        res.status(500).json(error)
    }
})
router.get(`/userOrders/:userId`, async (req, res) =>{
    const userOrdersList = await Order.find({user : req.params.userId}).populate({
        path : 'orderItems' , populate : {
            path : 'product' , populate : 'category'
        }
    }).sort({'dateCreated' : -1});
    if(!userOrdersList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrdersList);
})
module.exports =router;