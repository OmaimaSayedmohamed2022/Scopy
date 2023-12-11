const mongoose = require('mongoose')
const  Schema = mongoose.Schema

const scopeSchema =new Schema({
    scopeName:{
        type:String,
        required:true,
        term:true,
        default:null
    },
    describtion:{
        type:String,
        required:true,
        term:true,
        default:null
    },
    imageUrl:{
        type:String,
        required:true
    },
    latitude: {
        type: Number, 
        default: 0
    },
    longitude: {
        type: Number, 
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
    },
    


});
const scopes = mongoose.model('scopes', scopeSchema )

module.exports = scopes