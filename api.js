#!/usr/bin/env node

const express = require("express");
const https = require("https");
const fs = require("fs");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const cors = require("cors");

const port = process.env.PORT || 12389;
const { key, domain } = require("./key");

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
	username: "api",
	key,
	domain,
});

const app = express();

app.use(express.json());

const corsOptions = {
	origin: [
		"http://www.travisbriscoe.ca",
		"http://travisbriscoe.ca",
		"https://www.travisbriscoe.ca",
		"https://travisbriscoe.ca",
		"http://www.travisbriscoe.ca:80",
		"http://travisbriscoe.ca:80",
		"https://www.travisbriscoe.ca:443",
		"https://travisbriscoe.ca:443",
		"http://travisbriscoe.ca:12389",
		"http://www.travisbriscoe.ca:12389",
		"https://travisbriscoe.ca:12389",
		"https://www.travisbriscoe.ca:12389",
		"http://127.0.0.1:5500",
	],
	methods: "POST",
	allowedHeaders: "Access-Control-Allow-Headers, Access-Control-Allow-Origin, Origin, Content-Type",
	optionsSuccessStatus: 200,
	credentials: true,
};

app.use(cors(corsOptions));

app.post("/", (req, res) => {
	console.log("Attempting to send Message...");
	const { name, email, phone, subject, message } = req.body;
	let data = {};
	if (!phone || phone === "") {
		data = {
			from: `${name} <${email}>`,
			to: "travis.briscoe@gmail.com",
			subject: `New email from travisbriscoe.ca`,
			html: `Sent from: ${name}<br/>Email: ${email}<br/>Phone: Not Given<br/><br/>Subject: ${subject}<br/>Message:<br/>${message}`,
		};
	} else {
		data = {
			from: `${name} <${email}>`,
			to: "travis.briscoe@gmail.com",
			subject: `New email from travisbriscoe.ca`,
			html: `Sent from: ${name}<br/>Email: ${email}<br/>Phone: ${phone}<br/><br/>Subject: ${subject}<br/>Message:<br/>${message}`,
		};
	}

	return mg.messages
		.create(domain, data)
		.then((msg) => {
			console.log("...OK (200).");
			return res.status(200).send({ message: msg });
		})
		.catch((err) => {
			console.log("...Error!");
			console.log(err);
			return res.status(err.status).send({ error: err });
		});
});

var skey = fs.readFileSync(__dirname + "/certs/privkey.pem");
var cert = fs.readFileSync(__dirname + "/certs/cert.pem");

const options = {
	key: skey,
	cert,
};

const server = https.createServer(options, app);

server.listen(port, () => {
	console.log("HTTPS connected! Port: " + port);
});

// app.listen(port, "0.0.0.0", () => {
// 	console.log("Connected! Port: " + port);
// });
