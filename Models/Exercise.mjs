import mongoose, { Schema, model } from "mongoose";


const ExerciseSchema = mongoose.Schema({
    title : {
        type : String,
        required: true
    },

    description : {
        type : String,
        required: true
    },

    type : {
        type : String,
        required: true
    },

    duration : {
        type : String,
        required: true
    },

    date : {
        type : String,
        required: true
    }
},
{
    timestamp : true
})

export const ExerciseModel = mongoose.model (
    "exercise", ExerciseSchema
)