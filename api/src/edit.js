const crypto = require("crypto")
const express = require("express")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

const login = require("./login.js")

const router = express.Router()
router.use(bodyParser.json())
router.use(cookieParser())

const editingContext = {}

const ensureAccess = (req, res) => {
	// If the user isn't logged in, send "401 Not authorized".
	if(!login.isValidSession(req))
	{
		res.sendStatus(401)
		return false
	}

	// If the edititing ID is invalid, send "400 Bad request".
	if(!(req.params.editId in editingContext))
	{
		res.send(400)
		return false
	}

	return true
}

router.get("/listings", (req, res) => {
	if(!login.isValidSession(req))
	{
		res.send("[]")
		return
	}

	const listings = [] 
	const username = login.getUsername(req)

	// Collect the ongoing edits that are owned by the requesting user.
	for(const [key, value] of Object.entries(editingContext))
	{
		if(value.owner === username)
		{
			listings.push({
				id: key,
				name: value.name
			})
		}
	}

	res.send(JSON.stringify(listings))
})

router.post("/new", (req, res) => {
	if(!login.isValidSession(req))
	{
		res.send("{}")
		return
	}

	const id = crypto.randomUUID()

	editingContext[id] = {
		name: "New quiz",
		questions: {},
		owner: login.getUsername(req)
	}

	res.send(JSON.stringify({
		id: id
	}))
})

router.post("/quiz/:editId", (req, res) => {
	if(ensureAccess(req, res))
	{
	}
})

router.post("/question/add/:editId", (req, res) => {
	if(ensureAccess(req, res))
	{
		id = crypto.randomUUID()

		const newQuestion = {
			question: "New question",
			answer: "Default answer",
			image: ""
		}

		editingContext[req.params.editId].questions[id] = newQuestion
		res.send(JSON.stringify({id: id}))
	}
})

router.post("/question/remove/:editId/:questionId", (req, res) => {
	if(ensureAccess(req, res))
	{
	}
})

// Setter for a question within an editing context.
router.post("/question/:editId/:questionId", (req, res) => {
	if(ensureAccess(req, res))
	{
		// Make sure that the request body specified the new question and image.
		if(!("question" in req.body) || !("image" in req.body))
		{
			res.sendStatus(400)
			return
		}
	}
})

// Getter for a question within an editing context.
router.get("/question/:editId/:questionId", (req, res) => {
	if(ensureAccess(req, res))
	{
		const context = editingContext[req.params.editId]

		if(req.params.questionId in context.questions)
		{
			const question = context.questions[req.params.questionId]
			res.send(JSON.stringify(question))
		}

		else
		{
			res.send("{}")
		}
	}
})

router.get("/questionids/:editId", (req, res) => {
	if(ensureAccess(req, res))
	{
		// Send the result of Object.keys to the user. This is the same thing as an array if ids.
		res.send(JSON.stringify(Object.keys(editingContext[req.params.editId].questions)))
	}
})

module.exports.router = router
