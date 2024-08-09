const mongoose = require('mongoose')
const {Schema} =mongoose;

const candidateSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    age:{
        type: Number,
    },
    party:{
        type: String,
        required: true
    },
    vote:[
        
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
            },
            votedAt:{
                type:Date,
                default:Date.now()
            }
        }
    ],

    voteCount:{
        type: Number,
        default:0
    }


});
const candidate= mongoose.model('candidates',candidateSchema);
module.exports =candidate;
