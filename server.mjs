import express from "express";
import mongoose from "mongoose";
import { ExerciseModel } from "./Models/Exercise.mjs";
import cors from "cors";

const app = express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

app.get("/getcards",async(req,res)=>{
    try {
        const getdata = await ExerciseModel.find()
        res.status(200).json(getdata)
    } catch (error) {
   res.status(500).json({message:error.message})     
    }
})
app.post("/adddata", async(req,res)=>{
    try {
        const addtodb = await ExerciseModel.create(req.body)
        res.status(200).json(req.body)
    } catch (error) {
   res.status(500).json({message:error.message})     
    }
})

// EDIT DATA 
app.put('/data/:id', async(req, res)=>{
    try{
        const {id} = req.params
        const dataUpdate = await ExerciseModel.findByIdAndUpdate(id, req.body)
        if(!dataUpdate){
            res.status(404).json(`error #404, data not found on id: ${id}`)
        }
        const updateddata = await ExerciseModel.findById(id)
        res.status(200).json(updateddata)
    }
    catch(e){
        res.status(500).json({message: e.message})
    }
})

// DELETE DATA
app.delete('/data/:id', async(req, res)=> {
    try{
        const {id} = req.params
        const deletedata = await ExerciseModel.findByIdAndDelete(id)
        if(!deletedata){
            res.status(404).json(`error #404, data not found on id: ${id}`)
        }
        res.status(200).json(deletedata)
    }
    catch(e){
        res.status(500).json({message: e.message})
    }
})

mongoose.connect('mongodb+srv://ShayanFeroz:12345@bootcampprojectsh.dvowsfb.mongodb.net/exercisedata?retryWrites=true&w=majority')
.then (() => {
    console.log('database connected')

    app.listen(8080, () => {
        console.log('server running')
    })
})
.catch ((error) => {
    console.log(error.message)
})