"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import the express module
const express = require("express");
const Joi = require("joi");
// Create a new express application
const app = express();
// Define the port number
const port = 5000;
app.use(express.json()); // Add this line to enable JSON request body parsing
// Define a Joi schema for validation
const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    age: Joi.number().integer().min(18).max(150),
});
const pg = require("pg");
// Create a new Pool object
const pool = new pg.Pool({
    user: "postgres",
    password: "Emanuel12",
    database: "postgres",
    host: "localhost",
    port: 5432,
});
// Test the database connection
pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error("Database connection error", err);
    }
    else {
        console.log("Database connected");
    }
});
// Set up an Express route
app.get("/", (req, res) => {
    pool.query("SELECT * FROM postgres.public.workers", (err, result) => {
        if (err) {
            console.error("Database query error", err);
            res.status(500).send("Database query error");
        }
        else {
            console.log("Database query successful");
            res.json(result.rows);
        }
    });
});
// Define a GET API endpoint at '/api'
app.get("/api", (req, res) => {
    res.json({
        message: "Hello, this is a simple GET API!",
    });
});
// Define a GET API endpoint at '/api'
app.post("/api2", (req, res) => {
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
        console.error("Validation error:", validationResult.error.details);
        res.send("Failed");
    }
    else {
        console.log("Validation successful:", validationResult.value);
        res.send("Good");
    }
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map