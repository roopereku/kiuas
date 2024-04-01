const crypto = require("crypto")
const multer = require("multer")
const express = require("express")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

const login = require("./login.js")

const router = express.Router()
router.use(bodyParser.json())
router.use(cookieParser())

const isValidEdit = (req) => {
}

const imageStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "images/")
	},

	filename: (req, file, cb) => {
		req.resultImage = crypto.randomUUID()
		cb(null, req.resultImage)
	}
})

const editingContext = {}
const imageUpload = multer({
	storage : imageStorage,
	fileFilter: (req, file, cb) => {
		cb(null, true)
	}
})

const ensureAccess = (req, res, next) => {
	// If the user isn't logged in, send "401 Not authorized".
	if(!login.isValidSession(req))
	{
		res.sendStatus(401)
		return
	}

	// If the edititing ID is invalid, send "400 Bad request".
	if(!(req.params.editId in editingContext))
	{
		res.sendStatus(400)
		return
	}

	// TODO: Check context ownership.
	next()
}

const ensureValidQuestion = (req, res, next) => {
	if((req.params.questionId in editingContext[req.params.editId].questions))
	{
		next()
	}

	else
	{
		res.sendStatus(400)
	}
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

router.post("/quiz/:editId", ensureAccess, (req, res) => {
})

router.post("/question/add/:editId", ensureAccess, (req, res) => {
	id = crypto.randomUUID()

	const newQuestion = {
		question: "New question",
		answer: "Default answer",
		image: ""
	}

	editingContext[req.params.editId].questions[id] = newQuestion
	res.send(JSON.stringify({id: id}))
})

router.post("/question/remove/:editId/:questionId", ensureAccess, ensureValidQuestion, (req, res) => {
})

router.post("/image/:editId/:questionId", ensureAccess, imageUpload.single("image"), (req, res) => {
	if("resultImage" in req)
	{
		// If the image was saved, save it to the given editing context.
		editingContext[req.params.editId].questions[req.params.questionId].image = req.resultImage
		res.send(req.resultImage)
	}

	else
	{
		res.sendStatus(400)
	}
})

// Setter for a question within an editing context.
router.post("/question/:editId/:questionId", ensureAccess, ensureValidQuestion, (req, res) => {
	// Make sure that the request body specified the new question and image.
	if(!("question" in req.body) || !("image" in req.body))
	{
		res.sendStatus(400)
		return
	}

	const context = editingContext[req.params.editId]
	const question = context.questions[req.params.questionId]
	res.send(JSON.stringify(question))
})

// Getter for a question within an editing context.
router.get("/question/:editId/:questionId", ensureAccess, ensureValidQuestion, (req, res) => {
	const context = editingContext[req.params.editId]
	const question = context.questions[req.params.questionId]
	res.send(JSON.stringify(question))
})

router.get("/questionids/:editId", ensureAccess, (req, res) => {
	// Send the result of Object.keys to the user. This is the same thing as an array if ids.
	res.send(JSON.stringify(Object.keys(editingContext[req.params.editId].questions)))
})

module.exports.router = router
