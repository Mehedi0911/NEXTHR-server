
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const nodemailer = require('nodemailer')
dotenv.config();

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASS,
    database: 'nexthr',

})

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Mysql Connected');
})


app.post('/create', (req, res) => {
    const { firstName, lastName, email } = req.body;

    db.query('INSERT INTO employees (firstName, lastName, email) VALUES (?,?,?)',
        [firstName, lastName, email],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.status(200).json(result);
            }
        }
    )
})

app.get('/employees', (req, res) => {
    db.query("SELECT * from employees", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

app.post("/sendMail", async (req, res) => {
    try {
        let { email, recipients } = req.body
        const transport = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })

        await transport.sendMail({
            from: process.env.MAIL_FROM,
            to: recipients,
            subject: email.subject,
            html: `<div className="email" style="
        border: 1px solid black;
        padding: 20px;
        font-family: sans-serif;
        line-height: 2;
        font-size: 20px; 
        ">
        
        <p>${email.body}</p>
    
        <p>All the best, NEXT HR</p>
         </div>
    `
        });
        res.status(200).json({ message: 'Email Sent Successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Something Went Wrong, Please try again later' })
    }
})

app.get('/', (req, res) => {
    res.send('Welcome to NEXT HR Database')
})
app.listen(process.env.PORT || 5000, () => {
    console.log("Server is running on port 5000");
})