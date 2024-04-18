const crypto = require("crypto")
const multer = require("multer")
const express = require("express")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

const login = require("./login.js")

const router = express.Router()
router.use(bodyParser.json())
router.use(cookieParser())

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

const addNewAnswer = (editId, questionId) => {
	editingContext[editId].questions[questionId].answers.push({
		answer: "Default answer",
		image: ""
	})
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
		category: "Default",
		questions: {},
		owner: login.getUsername(req)
	}

	res.send(JSON.stringify({
		id: id
	}))
})

router.post("/quiz/location/:editId", ensureAccess, (req, res) => {
	if("name" in req.body)
	{
		editingContext[req.params.editId].name = req.body.name
	}

	if("category" in req.body)
	{
		editingContext[req.params.editId].category = req.body.category
	}

	res.sendStatus(200)
})

router.post("/quiz/publish/:editId", ensureAccess, (req, res) => {
})

router.post("/question/add/:editId", ensureAccess, (req, res) => {
	id = crypto.randomUUID()

	const newQuestion = {
		question: "New question",
		image: "",
		answers: []
	}

	editingContext[req.params.editId].questions[id] = newQuestion
	addNewAnswer(req.params.editId, id)
	res.send(JSON.stringify({id: id}))
})

router.post("/question/newanswer/:editId/:questionId", ensureAccess, ensureValidQuestion, (req, res) => {
	addNewAnswer(req.params.editId, req.params.questionId)
	res.sendStatus(200)
})

router.post("/question/remove/:editId/:questionId", ensureAccess, ensureValidQuestion, (req, res) => {
})

router.post("/image/remove/:editId/:questionId", ensureAccess, ensureValidQuestion, (req, res) => {
	const question = editingContext[req.params.editId].questions[req.params.questionId]

	// TODO: Once the images get reference counts, delete the actual image file when nobody uses it?
	// This only makes sense when duplicate images aren't saved.

	// If an answer index is specified, attach the image to an answer.
	if("answerIndex" in req.body)
	{
		const index = parseInt(req.body.answerIndex)
		if(index < question.answers.length)
		{
			question.answers[index].image = ""
		}
	}

	else
	{
		question.image = ""
	}

	res.sendStatus(200)
})

router.post("/image/add/:editId/:questionId", ensureAccess, ensureValidQuestion, imageUpload.single("image"), (req, res) => {
	// If the image was saved, save it to the given editing context.
	if("resultImage" in req)
	{
		const question = editingContext[req.params.editId].questions[req.params.questionId]

		// If an answer index is specified, attach the image to an answer.
		if("answerIndex" in req.body)
		{
			// TODO: Delete the image if the answer index is invalid?
			const index = parseInt(req.body.answerIndex)
			if(index < question.answers.length)
			{
				question.answers[index].image = req.resultImage
			}
		}

		else
		{
			question.image = req.resultImage
		}

		res.send(req.resultImage)
	}

	else
	{
		res.sendStatus(400)
	}
})

// Setter for a question within an editing context.
router.post("/question/:editId/:questionId", ensureAccess, ensureValidQuestion, (req, res) => {
	const question = editingContext[req.params.editId].questions[req.params.questionId]

	if("question" in req.body)
	{
		question.question = req.body.question
	}

	if("answer" in req.body)
	{
		if(!("answerIndex" in req.body))
		{
			res.sendStatus(400)
			return
		}

		question.answers[parseInt(req.body.answerIndex)].answer = req.body.answer
	}

	res.sendStatus(200)
})

// Getter for a question within an editing context.
router.get("/question/:editId/:questionId", ensureAccess, ensureValidQuestion, (req, res) => {
	const context = editingContext[req.params.editId]
	const question = context.questions[req.params.questionId]
	res.send(JSON.stringify(question))
})

router.get("/quizdata/:editId", ensureAccess, (req, res) => {
	const ctx = editingContext[req.params.editId]

	res.send(JSON.stringify({
		name: ctx.name,
		category: ctx.category,
		questions: Object.keys(ctx.questions)
	}))
})

module.exports.router = router
