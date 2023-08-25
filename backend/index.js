import OpenAI from 'openai';
import express from 'express';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import cors from 'cors';

//MongoDB
import { MongoClient, ServerApiVersion } from 'mongodb';
const uri = "mongodb+srv://amangupta:nQ6a1r2kjP4zjGuu@cluster0.knsa2oe.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


//OPENAI Connect
const openai = new OpenAI({
  apiKey: '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', // defaults to process.env["OPENAI_API_KEY"]
});

const msgList = [{
  role: 'system',
  content: 'You have to act like a chatbot for a company website. All answers you give to any further question should resonate with that of a chatbot. Start with a hi like a chatbot would.',
}]; 

const corsOptions = {
  origin: 'http://localhost:3000', 
  optionsSuccessStatus: 200 
};

var db = null

const app = express();
app.set('view engine', 'ejs');

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", function(req,res){
    initialize().then(x=> {
      res.send(x);
    });
});

app.post("/sendMessage", function(req,res){
  const usrReq = {
    role : "user",
    content: req.body.message
  }
    getResponse(usrReq).then(x => {
      res.send({x});
      addToDb(usrReq,x);
    });
    
})

async function initialize(){
    //INIT OpenAI API
    const completion = await openai.chat.completions.create({
        messages: msgList,
        model: 'gpt-3.5-turbo'
    });
    addAIResponse(completion.choices[0].message)
    console.log(completion.choices[0].message)
    return (completion.choices[0].message)
    
}





async function getResponse(message) {
  console.log("Get response started")
    // console.log(msgList);
    
    addUsrMsg(message);
    
  const completion = await openai.chat.completions.create({
    messages: msgList,
    model: 'gpt-3.5-turbo',
  });
  
  
  addAIResponse(completion.choices[0].message);
  
  return completion.choices[0].message;
}

function addUsrMsg(msg){
  msgList.push(msg)
  
}

function addAIResponse(msg){

  msgList.push(msg)
}

async function addToDb(usrmsg,airesponse){
  
  usrmsg.time = new Date().toLocaleString();
  airesponse.time = new Date().toLocaleString();
  const arr = [usrmsg,airesponse]
  console.log(arr)
  try {
    await client.connect();

    const db = client.db("chatbot");
    const conversation = db.collection("conversations");

    const res = await conversation.insertMany(arr);
    console.log(`${res.insertedCount} documents were inserted`);
  } catch (error) {
    console.error("Error inserting documents:", error);
  } finally {
    await client.close();
  }
}


app.listen(8000, function() {
    console.log("Server started on port 8000");
  });
  