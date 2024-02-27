const express = require("express")
const bodyParser = require("body-parser")

const login = require("./login.js")

const router = express.Router()
router.use(bodyParser.json())

const editingContext = {}

router.post("/quiz/:quizId", (req, res) => {
})

router.post("/question/add", (req, res) => {
})

router.post("/question/:questionId", (req, res) => {
	// If the user isn't logged in, send "401 Not authorized".
	if(!login.isValidSession(req))
	{
		res.sendStatus(401)
		return
	}

	// Make sure that the request body specified the new question and image.
	if(!("question" in req.body) || !("image" in req.body))
	{
		res.sendStatus(400)
		return
	}
})

module.exports.router = router
