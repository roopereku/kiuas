const crypto = require("crypto")
const express = require("express")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")

const db = require("./database.js")

const router = express.Router()
router.use(cookieParser())
router.use(bodyParser.json())

let activeSessions = {}

const isValidSession = (req) => {
	return "session" in req.cookies && req.cookies.session in activeSessions
}

const getUsername = (req) => {
	if(isValidSession(req))
	{
		return activeSessions[req.cookies.session]
	}

	return ""
}

const hashPassword = (unhashedPassword) => {
	return unhashedPassword
}

const createUser = (username, password) => {
	db.query("INSERT INTO credential (name, password) VALUES ($1, $2)", [ username, hashPassword(password) ])
}


router.post("/", (req, res) => {
	// Only of the username and password are present, try to log in.
	if("username" in req.body &&
		"password" in req.body)
	{
		db.query("SELECT password FROM credential WHERE name = $1", [ req.body.username ])
			.then((rows) => {
				// If no hashed password was returned, the username was invalid.
				// Additionally if the password is incorrect, return an error code.
				if(rows.length === 0 || hashPassword(req.body.password) !== rows[0].password)
				{
					res.sendStatus(401)
					return
				}

				// The username and password are correct.
				else
				{
					// If the user already has a valid session token, do nothing.
					if(isValidSession(req))
					{
						res.sendStatus(200)
						return
					}

					// Generate a session token and track it as active.
					const id = crypto.randomUUID()
					activeSessions[id] = req.body.username

					// Send the session token to the logged in user as a HTTP cookie.
					res.cookie("session", id, {
						maxAge: 900000,
						httpOnly: true,
						sameSite: "strict"
					})

					res.sendStatus(200)
				}
			})
	}

	// If the username or password isn't present, send "400 Bad request".
	else
	{
		res.sendStatus(400)
	}
})

router.get("/check", (req, res) => {
	if(!isValidSession(req))
	{
		// If the user doesn't have a valid session, send"401 Unauthorized"
		// to indicate that they should log in.
		res.sendStatus(401)
		return
	}

	res.sendStatus(200)
})

router.post("/register", (req, res) => {
	// Ensure that the username and the password are in the request body.
	if(!("username" in req.body) ||
		!("password" in req.body))
	{
		res.sendStatus(400)
		return
	}

	// TODO: Ensure that username and password are strings?
	if(req.body.username === "" ||
		req.body.password === "")
	{
		res.sendStatus(400)
		return
	}

	db.query("INSERT INTO credential (name, password) VALUES ($1, $2)",
		[ req.body.username, hashPassword(req.body.password) ])
		.catch((err) => {
			// Check if the username already exists.
			if(err.code === "23505")
			{
				// TODO: Send an error to the user.
				console.log("TODO: Indicate that user", req.body.username, "already exists")
			}
		})
})

module.exports.router = router
module.exports.isValidSession = isValidSession
module.exports.getUsername = getUsername
