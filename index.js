const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Toy Man Server Is Running");
});

const uri = `mongodb+srv://${process.env.DB_UserName}:${process.env.DB_Pass}@cluster0.pmxdri5.mongodb.net/?retryWrites=true&w=majority`;

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
    app.get("/toysData", async (req, res) => {
      const toysData = client.db("ToysData").collection("ToyData");
      const result = await toysData.find().limit(20).toArray();
      res.send(result);
    });
    app.get("/toysData/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const toysData = client.db("ToysData").collection("ToyData");
      const result = await toysData.find(query).toArray();
      res.send(result);
    });
    app.get("/toysData", async (req, res) => {
      const { sort } = req.query;
      const toysData = client.db("ToysData").collection("ToyData");

      let sortOption = {};

      if (sort === "asc") {
        sortOption = { price: 1 };
      } else if (sort === "desc") {
        sortOption = { price: -1 };
      }

      try {
        const result = await toysData.find().sort(sortOption).toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.post("/toysData", async (req, res) => {
      const data = req.body;
      console.log(data);
      const toyData = client.db("ToysData").collection("ToyData");
      const result = await toyData.insertOne(data);
      res.send(result);
    });
    app.patch("/toysData/:id", (req, res) => {
      const id = req.params.id;
      console.log(id);
      const data = req.body;
      console.log(data);
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          price: data.price,
          quantity: data.quantity,
          details: data.details,
        },
      };
      const toyData = client.db("ToysData").collection("ToyData");
      const result = toyData.updateOne(query, updateDoc);
      res.send(result);
    });
    app.delete("/toysData/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const toysData = client.db("ToysData").collection("ToyData");
      const result = await toysData.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Toy Man Server Running At ${PORT}`);
});
