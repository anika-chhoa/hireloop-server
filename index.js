const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("hire_loop_db");
    const jobCollection = database.collection("jobs");
    const companyCollection = database.collection("companies");
    const userCollection=database.collection("user")

    //all users
    app.get("/api/user",async(req,res)=>{
      const result=await userCollection.find().toArray();
      res.send(result)
    })

    //all companies
    app.get("/api/companies",async(req,res)=>{
      const result=await companyCollection.find().toArray();
      res.send(result)
    })


    app.get("/api/jobs", async (req, res) => {
      const query = {};
      if (req.query.companyId) {
        query.companyId = req.query.companyId;
      }
      if (req.query.status) {
        query.status = req.query.status;
      }
      const cursor = jobCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/api/jobs/:id", async (req,res)=>{
      const id= req.params.id;
      const query={
        _id: new ObjectId(id)
      }
      const result= await jobCollection.findOne(query);
      res.send(result)
    })

    app.post("/api/jobs", async (req, res) => {
      const job = req.body;
      const newJob={
        ...job,
        createdAt:new Date()
      }
      const result = await jobCollection.insertOne(newJob);
      res.send(result);
    });

    //for company
    app.get("/api/my/company", async (req, res) => {
      const query = {};
      if (req.query.recruiterId) {
        query.recruiterId = req.query.recruiterId;
      }
    
      const result = await companyCollection.findOne(query);
      res.send(result || {});
    });
    app.post("/api/companies", async (req, res) => {
      const company = req.body;
      const newCompany={
        ...company,
        createdAt:new Date()
      }
      const result = await companyCollection.insertOne(newCompany);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } catch (error) {
    console.error(error);
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
