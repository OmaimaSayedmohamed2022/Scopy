// const Scope = require("../models/scopeSchema")
// const express = require('express');
// const {validateString, ValidLongitude, ValidLatitude} = require("../config/validation")

// const scope_create= async(req,res)=>{
//  try{
//     const {scopeName , describtion ,latitude, longitude, imageUrl,userId} = req.body;
//     if(!validateString(scopeName )) return res.status(400).json({status:0 ,message:"invalid scopeName"})
//     if(!validateString(describtion)) return res.status(400).json({status:0 ,message:"invalid describtion"})
//     if (!ValidLongitude(longitude)) return res.status(400).json({ status: 0, message: 'Invalid Longitude'});
//     if (!ValidLatitude(latitude)) return res.status(400).json({ status: 0, message: 'Invalid Latitude'});
      
//     const newScope = new Scope({
//         scopeName , 
//         describtion ,
//         latitude,
//         longitude,
//         imageUrl,
//         user: userId,
//     });
//     await newScope.save();
//     res.status(201).json({stuts:1 , message:"Scpoe Created Successfully"})
//  }
// catch(error){
//     res.status(500).json({stuts:0 , message:"Error in Created  Scope" , Error :error.message})
// }

// }

// module.exports = {
//     scope_create
// }

const Scope = require("../models/scopeSchema");
const { validateString, ValidLongitude, ValidLatitude } = require("../config/validation");

const scope_create = async (req, res) => {
  try {
   
    const { scopeName, describtion, latitude, longitude} = req.body;
    if (!validateString(scopeName)) return res.status(400).json({ status: 0, message: "invalid scopeName" });
    if (!validateString(describtion)) return res.status(400).json({ status: 0, message: "invalid describtion" });
    if (!ValidLongitude(longitude)) return res.status(400).json({ status: 0, message: 'Invalid Longitude' });
    if (!ValidLatitude(latitude)) return res.status(400).json({ status: 0, message: 'Invalid Latitude' });

    const newScope = new Scope({...req.body, user:req.userId }); 

    await newScope.save();
    res.status(201).json({ status: 1, message: "Scope Created Successfully" });
  }
  catch (error) {
    res.status(500).json({ status: 0, message: "Error in Created Scope", Error: error.message });
  }
}

const   scope_getById = async (req, res) => {
    try {
      const scopeId = req.params.id;
      const { scopeName, describtion, latitude, longitude, imageUrl } = req.body;
      
      if (!validateString(scopeName)) return res.status(400).json({ status: 0, message: "invalid scopeName" });
      if (!validateString(describtion)) return res.status(400).json({ status: 0, message: "invalid describtion" });
      if (!ValidLongitude(longitude)) return res.status(400).json({ status: 0, message: 'Invalid Longitude' });
      if (!ValidLatitude(latitude)) return res.status(400).json({ status: 0, message: 'Invalid Latitude' });
  
      const updatedScope = await Scope.findByIdAndUpdate(scopeId, {
        scopeName,
        describtion,
        latitude,
        longitude,
        imageUrl,
      }, { new: true });
  
      if (!updatedScope) {
        return res.status(404).json({ status: 0, message: 'Scope not found' });
      }
  
      res.status(200).json({ status: 1, message: 'Scope updated successfully', data: updatedScope });
    } catch (error) {
      res.status(500).json({ status: 0, message: 'Error updating scope', Error: error.message });
    }
  }
  const scope_updateById = async (req, res) => {
    try {
      const scopeId = req.params.id;
      const { scopeName, describtion, latitude, longitude, imageUrl } = req.body;
      
      if (!validateString(scopeName)) return res.status(400).json({ status: 0, message: "invalid scopeName" });
      if (!validateString(describtion)) return res.status(400).json({ status: 0, message: "invalid describtion" });
      if (!ValidLongitude(longitude)) return res.status(400).json({ status: 0, message: 'Invalid Longitude' });
      if (!ValidLatitude(latitude)) return res.status(400).json({ status: 0, message: 'Invalid Latitude' });
  
      const updatedScope = await Scope.findByIdAndUpdate(scopeId, {
        scopeName,
        describtion,
        latitude,
        longitude,
        imageUrl,
      }, { new: true });
  
      if (!updatedScope) {
        return res.status(404).json({ status: 0, message: 'Scope not found' });
      }
  
      res.status(200).json({ status: 1, message: 'Scope updated successfully', data: updatedScope });
    } catch (error) {
      res.status(500).json({ status: 0, message: 'Error updating scope', Error: error.message });
    }
  }
  
const scope_deleteById = async (req, res) => {
  try {
    const scopeId = req.params.id;
    const deletedScope = await Scope.findByIdAndDelete(scopeId);

    if (!deletedScope) {
      return res.status(404).json({ status: 0, message: 'Scope not found' });
    }

    res.status(200).json({ status: 1, message: 'Scope deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 0, message: 'Error deleting scope', Error: error.message });
  }
}

const scope_getAll = async (req, res) => {
    try {
      const scopes = await Scope.find({});
      res.status(200).json({ status: 1, data: scopes });
    } catch (error) {
      res.status(500).json({ status: 0, message: 'Error fetching scopes', error: error.message });
    }
  }

module.exports = {
  scope_create,
  scope_getById,
  scope_updateById,
  scope_deleteById,
  scope_getAll,
};
