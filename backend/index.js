const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
require('dotenv').config()

const port = process.env.PORT || 5000
// middleware setup
app.use(express.json({ limit: "25mb" }));
app.use((express.urlencoded({ limit: "25mb" })))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

// all routes
const userRoutes = require("./src/routes/user.route");
app.use('/api/auth', userRoutes);

main().then(() => console.log("Database sucessfully connected.")).catch(err => console.log(err));
async function main() {
    await mongoose.connect(process.env.DB_URL);
}
app.get('/', (req, res) => {
    res.send('hello world')
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})