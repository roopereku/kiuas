const crypto = require("crypto")
const express = require("express")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")

const router = express.Router()
router.use(cookieParser())
router.use(bodyParser.json())

let activeSessions = {}

const isValidSession = (req) => {
	return "session" in req.cookies && req.cookies.session in activeSessions
}

const getUsername = (req) => {
	return activeSessions[req.cookies.session]
}

const isValidUser = (username) => {
	// TODO: Fetch from database.
	return username === "admin"
}

const isPasswordCorrect = (username, password) => {
	return username === "admin" && password === "pass"
}

router.post("/", (req, res) => {
	// Only of the username and password are present, try to log in.
	if("username" in req.body &&
		"password" in req.body)
	{
		// If the username is invalid, or the password is incorrect, send "401 Not authorized".
		if(!isValidUser(req.body.username) ||
			!isPasswordCorrect(req.body.username, req.body.password))
		{
			res.sendStatus(401)
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

module.exports.router = router
module.exports.isValidSession = isValidSession
module.exports.getUsername = getUsername
