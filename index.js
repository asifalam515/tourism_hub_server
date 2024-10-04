const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
var cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// mongo

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6tngyrc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // mongoDB
    const database = client.db("spotDB");
    const spotCollection = database.collection("touristSpot");
    const userCollection = database.collection("users");
    // insert Data
    app.post("/spot", async (req, res) => {
      const newSpot = req.body;
      const result = await spotCollection.insertOne(newSpot);
      res.send(result);
    });

    // get spots data
    app.get("/spot", async (req, res) => {
      const cursor = await spotCollection.find().sort({ cost: 1 }).toArray();
      res.send(cursor);
    });
    // get all spot data
    app.get("/allspot", async (req, res) => {
      const cursor = await spotCollection.find().sort({ cost: 1 }).toArray();
      res.send(cursor);
    });

    // user related API
    app.post("/user", async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
      console.log(result);
    });
    // get tourist spot based on email address
    app.get("/mylist", async (req, res) => {
      const { email } = req.query;
      const cursor = await spotCollection.find().toArray();
      res.send(cursor);
    });
    // delete a specific doc on my list
    app.delete("/mylist/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotCollection.deleteOne(query);
      res.send(result);
    });

    // update a specific spot
    // step 1 :find the spot
    app.get("/mylist/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotCollection.findOne(query);
      res.send(result);
    });
    // step 2:update the doc
    app.put("/mylist/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedSpot = req.body;
      console.log(updatedSpot);
      const spot = {
        $set: {
          image: updatedSpot.image,
          touristsSpotName: updatedSpot.touristsSpotName,
          countryName: updatedSpot.countryName,
          location: updatedSpot.location,
          description: updatedSpot.description,
          cost: updatedSpot.cost,
          season: updatedSpot.season,
          time: updatedSpot.time,
          visitors: updatedSpot.visitors,
          email: updatedSpot.email,
          user_name: updatedSpot.user_name,
        },
      };
      const result = await spotCollection.updateOne(filter, spot, options);
      res.send(result);
    });

    // get specific data for showing details
    app.get("/viewdetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotCollection.findOne(query);
      res.send(result);
    });
    // Get tourist spots based on email address
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
// mongo
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
