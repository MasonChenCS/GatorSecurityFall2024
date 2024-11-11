const mongoose = require("mongoose")

//User information schema
const userDBSchema = new mongoose.Schema(
    {
        fname:String,
        lname:String,
        email:{type:String, unique:true},
        password:String,
        learnscore:Array,
        gamescore:Array,
        isAdmin:{type:Boolean, default:false},
        accountType:String,
        avatarframe:Number
    },
    {
        collection: "UserInfo",
    }
);

//Traditional learn question schema
const traditionalQuestionDBSchema = new mongoose.Schema(
    {
		question:String,
		type:Number,
		topic:Number,
		options:Array,
		answer:String,
        displayType: { 
            type: String, 
            enum: ['learn','game']
        }
    },
    {
        collection: "TraditionalQuestionInfo",
    }
);

//Game question schema - game questions contain IDs for CYOA, DND, or Matching questions in the questionData array
const gameQuestionDBSchema = new mongoose.Schema(
    {
        name:String,
        questionData:Array,
        topic:Number,
        type:Number,
    },
    {
        collection: "GameQuestionInfo",
    }
)

//CYOA question schema
const CYOAQuestionDBSchema = new mongoose.Schema(
    {
        parentQuestionId:mongoose.Schema.Types.ObjectId,
        questionNumber:Number,
        question:String,
        type:Number,
        options:Array,
        answer:String,
        stimulus:String,
        explanation:String,
    },
    {
        collection: "CYOAQuestionInfo"
    }
)

//DND question schema
const DNDQuestionDBSchema = new mongoose.Schema(
    {
        parentQuestionId:mongoose.Schema.Types.ObjectId,
        question:String,
        answer:Array, // this should always be in the correct order
        stimulus:String,
        explanation:String, 
    },
    {
        collection: "DNDQuestionInfo"
    }
)

//Matching question schema
const MatchingQuestionDBSchema = new mongoose.Schema(
    {
        parentQuestionId:mongoose.Schema.Types.ObjectId,
        content:Map
    },
    {
        collection: "MatchingQuestionInfo"       
    }
)

//Class schema
const ClassDBSchema = new mongoose.Schema(
    {
        name:{type:String, unique:true},
        educator:String,
        students:{type:Array, default:null}
    },
    {
        collection:"Classes"
    }
)
//Account Type schema
const AccountTypeSchema = new mongoose.Schema(
    {
        name: String
    },
    {
        collection: "AccountType"
    }
)
//Model each schema
mongoose.model("UserInfo", userDBSchema);
mongoose.model("TraditionalQuestionInfo", traditionalQuestionDBSchema);
mongoose.model("GameQuestionInfo", gameQuestionDBSchema);
mongoose.model("CYOAQuestionInfo", CYOAQuestionDBSchema);
mongoose.model("DNDQuestionInfo", DNDQuestionDBSchema);
mongoose.model("MatchingQuestionInfo", MatchingQuestionDBSchema);
mongoose.model("AccountType", AccountTypeSchema);
mongoose.model("Classes", ClassDBSchema);