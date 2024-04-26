const crypto = require("crypto")
const multer = require("multer")
const express = require("express")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

const login = require("./login.js")
const db = require("./database.js")

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
	editingContext[editId].questions[questionId].elements.push({
		type: "answer",
		value: "Default answer",
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
		owner: login.getUsername(req),
		base: ""
	}

	res.send(JSON.stringify({
		id: id
	}))
})

router.post("/quiz/publish/:editId", ensureAccess, (req, res) => {
	const ctx = editingContext[req.params.editId]
	delete editingContext[req.params.editId]
	console.log(ctx)

	// If there's no base for the editing context, it's a newly made quiz.
	if(ctx.base === "")
	{
		const quizId = crypto.randomUUID()

		db.query("INSERT INTO quiz (id, name, category) VALUES ($1, $2, $3)",
				[ quizId, ctx.name, ctx.category ])
			.then(() => {
				// Add questions of the given quiz to the database.
				for (const [key, value] of Object.entries(ctx.questions))
				{
					const elementIds = []

					// Add the elements of the given question to the database.
					value.elements.forEach((e) => {
						const elementId = crypto.randomUUID()
						db.query("INSERT INTO element (id, type, value, image) VALUES ($1, $2, $3, $4)",
								[ elementId, e.type, e.value, e.image ])

						elementIds.push(elementId)
					})

					db.query("INSERT INTO question (id, elements) VALUES ($1, $2)",
							[ key, elementIds ])
				}

				db.query("INSERT INTO revision (id, quizId, authorized, questions) VALUES ($1, $2, $3, $4)",
						[ crypto.randomUUID(), quizId, [ ctx.owner ], Object.keys(ctx.questions) ])
			})
	}

	res.sendStatus(200)
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

router.post("/question/add/:editId", ensureAccess, (req, res) => {
	id = crypto.randomUUID()

	const newQuestion = {
		type: "question",
		value: "New question",
		image: ""
	}

	editingContext[req.params.editId].questions[id] = {
		elements: [ newQuestion ]
	}

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
	const elements = editingContext[req.params.editId].questions[req.params.questionId].elements

	// TODO: Once the images get reference counts, delete the actual image file when nobody uses it?
	// This only makes sense when duplicate images aren't saved.

	const index = parseInt(req.body.index)
	if(index < elements.length)
	{
		elements[index].image = ""
	}

	res.sendStatus(200)
})

router.post("/image/add/:editId/:questionId", ensureAccess, ensureValidQuestion, imageUpload.single("image"), (req, res) => {
	// If the image was saved, save it to the given editing context.
	if("resultImage" in req)
	{
		const elements = editingContext[req.params.editId].questions[req.params.questionId].elements

		// TODO: Delete the image if the element index is invalid?
		const index = parseInt(req.body.index)
		if(index < elements.length)
		{
			elements[index].image = req.resultImage
			res.send(req.resultImage)
		}

		else
		{
			res.send("")
		}
	}

	else
	{
		res.sendStatus(400)
	}
})

router.post("/question/:editId/:questionId", ensureAccess, ensureValidQuestion, (req, res) => {
	const elements = editingContext[req.params.editId].questions[req.params.questionId].elements

	const index = parseInt(req.body.index)
	if(index < elements.length)
	{
		if("value" in req.body)
		{
			elements[index].value = req.body.value
		}
	}

	res.sendStatus(200)
})

router.get("/quizinfo/:editId", ensureAccess, (req, res) => {
	const ctx = editingContext[req.params.editId]

	res.send(JSON.stringify({
		name: ctx.name,
		category: ctx.category
	}))
})

router.get("/quizdata/:editId", ensureAccess, (req, res) => {
	const ctx = editingContext[req.params.editId]
	const data = []

	for (const [key, value] of Object.entries(ctx.questions)) {
		data.push({
			id: key,
			elements: value.elements.map((e, index) => {
				return {
					index: index,
					type: e.type,
					value: e.value,
					image: e.image
				}
			})
		})
	}

	res.send(JSON.stringify(data))
})

module.exports.router = router
