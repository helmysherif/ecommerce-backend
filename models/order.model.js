const mongoose = require('mongoose');
const orderSchema = mongoose.Schema({
    orderItems : [{
        type : mongoose.Schema.Types.ObjectId,
        ref:'orderitem',
        required:true
    }],
    shippingAddress1 : {
        type : String,
        required : true
    },
    shippingAddress2 : {
        type : String,
        default : ''
    },
    city : {
        type : String,
        required : true
    },
    zip : {
        type : String,
        required : true
    },
    country : {
        type : String,
        required : true
    },
    status : {
        type : String,
        required : true,
        default : 'Pending'
    },
    totalPrice : {
        type : Number
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required : true
    },
    city : {
        type : String,
        required : true
    },
    dateCreated: {
        type : Date,
        default : Date.now()
    },
})
orderSchema.virtual('id').get(function(){
    return this._id.toHexString()
})
orderSchema.set('toJSON' , {
    virtuals : true
})
exports.Order = mongoose.model('order', orderSchema);