const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const UserModel = require('./models/User')

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb://localhost:27017/User")

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json("User not found");
        }
        if (user.password !== password) {
            return res.status(401).json("Invalid credentials");
        }
        res.json("Success");
    } catch (err) {
        res.status(500).json(err);
    }
});


app.post('/register', (req, res) => {
    const { email, name, password } = req.body;

    
    UserModel.findOne({ email })
        .then(existingUser => {
            if (existingUser) {
                
                return res.status(400).json({ message: "User already exists" });
            }

            UserModel.create(req.body)
                .then(user => res.json(user))  
                .catch(err => res.status(500).json({ message: "Server error", error: err })); 
        })
        .catch(err => res.status(500).json({ message: "Error finding user", error: err })); 
});

app.listen(3001, () => {
    console.log("server is running")
})
