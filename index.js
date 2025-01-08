const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const express = require('express');
const app= express();
const port = process.env.PORT || 4000;
const cors = require ('cors');

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ejql3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

const queryCollection = client.db("queryDB").collection('query');
const recommendationCollection = client.db("queryDB").collection("recommendation");


app.post('/query',async(req,res)=>{
  const {
    productName,
    productBrand,
    productImage,
    queryTitle,
    boycottingReason,
    email,
    name,
    photo,
    createdAt,
    recommendationCount
} = req.body;

const newQuery = {
    productName,
    productBrand,
    productImage,
    queryTitle,
    boycottingReason,
    email,
    name,
    photo,
    createdAt: createdAt, 
    recommendationCount: recommendationCount || 0, 
};
  const result = await queryCollection.insertOne(newQuery);
  res.send(result);
})

app.post('/recommendation', async (req, res) => {
  const recommendation = req.body;
  const result = await recommendationCollection.insertOne(recommendation);
  res.send(result);
});
app.get('/recommendation',async(req,res)=>{
  const {email}= req.query;
  const result = await recommendationCollection.find({ recommenderEmail: email }).toArray();
  res.send(result)
})
app.get('/recommendation/:id', async (req, res) => {
  const id = req.params.id;
  const cursor = recommendationCollection.find({ queryId : id});
  const result = await cursor.toArray();
  res.send(result);
});


app.get('/query',async(req,res)=>{
  const cursor = queryCollection.find();
  const result = await cursor.toArray();
  res.send(result)
})
app.get('/query/:id',async(req,res)=>{
  const id = req.params.id;
  const query = {_id:new ObjectId(id)};
  const result = await queryCollection.findOne(query);
  res.send(result)
})

app.put('/query/:id',async(req,res) =>{
  const id = req.params.id;
  const filter = {_id:new ObjectId(id)};
  const options = {upsert:true};
  const updatedQuery = req.body;
  const updateQuery = {
    $set:{
      productName:updatedQuery.productName,
      productBrand:updatedQuery.productBrand,
      productImage:updatedQuery.productImage,
      queryTitle:updatedQuery.queryTitle,
      boycottingReason:updatedQuery.boycottingReason,
    }
  }
  const result = await queryCollection.updateOne(filter,updateQuery);
  res.send(result);
})

app.patch("/query/:id/increment", async (req, res) => {
  const queryId = req.params.id;
    const result = await queryCollection.updateOne(
      { _id:new ObjectId(queryId) },
      { $inc: { recommendationCount: 1 } }
    );
res.send(result);
});

// app.get('/equipmenthome', async (req, res) => {
//   const limit = parseInt(req.query.limit) || 6;
//   const cursor = equipmentCollection.find().limit(limit);
//   const result = await cursor.toArray();
//   res.send(result);
// });

app.delete('/query/:id',async(req,res)=>{
  const id = req.params.id;
  const query = {_id:new ObjectId(id)};
  const result = await queryCollection.deleteOne(query);
  res.send(result)
  })
app.delete('/recommendation/:id',async(req,res)=>{
const id = req.params.id;
const recom = {_id:new ObjectId(id)};
const result = await recommendationCollection.deleteOne(recom);
res.send(result);
})
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);




app.get('/',(req,res)=>{
   res.send('Query Nest is Running')
})

app.listen(port,()=>{
    console.log(`Server is running in ${port}`);
})