const crypto = require("crypto")
const express = require("express")
const cookieParser = require("cookie-parser")

const login = require("./login.js")

const router = express.Router()
router.use(cookieParser())

const quizdata = {
	"quizid1": {
		name: "Test Quiz 1",
		category: "Cat1"
	},
	"jkdsajkld": {
		name: "Test Quiz jdkslfjkldsfjkldsf",
		category: "Cat1"
	},
	"xkdsajkld": {
		name: "Test Quiz in cat ejkew",
		category: "Cat1"
	},
	"quizid2": {
		name: "Test Quiz 2",
		category: "Cat2",
		questions: [
			{
				question: "Test question 1",
				answer: "Test answer 1"
			},
			{
				question: "Test question 2",
				answer: "Test answer 2"
			}
		]
	},
	"quizid3": {
		name: "Test Quiz 3",
		category: "long category name",
		questions: [
			{
				question: "Test question 1",
				answer: "Test answer 1"
			},
			{
				question: "Test question 2",
				answer: "Test answer 2"
			}
		]
	},
	"quizid4": {
		name: "Test Quiz 4",
		category: "long category name",
	},
}

const getListings = (username) => {
	// TODO: Filter listings by username.
	// TODO: Get listings from database.
	const listings = []

	for(const [key, value] of Object.entries(quizdata))
	{
		listings.push({
			id: key,
			name: value.name,
			category: value.category
		})
	}

	return listings
}

const isValidQuiz = (quizId) => {
	// TODO: Get this from the database.
	return true
}

const getQuestionIds = (quizId) => {
	if(isValidQuiz(quizId))
	{
		// TODO: Get this from the database.
		return [ "que1id", "que2id", "que2id", "que4id" ]
	}

	return []
}

const getQuestion = (questionId) => {
	// TODO: Get this from the database.
	return {
		question: "Stub question",
		image: ""
	}
}

router.get("/listings", (req, res) => {
	// If the user isn't logged in, send an empty array.
	if(!login.isValidSession(req))
	{
		res.send("[]")
		return
	}

	// Send the listings to the user.
	const listings = getListings(login.getUsername(req))
	res.send(JSON.stringify(listings))
})

router.get("/question/getids/:quizId", (req, res) => {
	console.log("nii", req.params.quizId)

	// If the user isn't logged in, send an empty array.
	if(!login.isValidSession(req))
	{
		res.send("[]")
		return
	}

	// Get the ID of every question of the given quiz.
	let questionIds = getQuestionIds(req.params.quizId)

	// If question IDs were returned, operate on them.
	if(questionIds.length > 0)
	{
		// First shuffle the questions if necessary.
		if("shuffle" in req.query)
		{
			questionIds = questionIds
				.map(id => ({ id , sort: Math.random() }))
				.sort((a, b) => a.sort - b.sort)
				.map(({ id }) => id)
		}

		// If a max question amount is given, cut the ID array.
		if("max" in req.query)
		{
			if(questionIds.length >= req.query.max)
			{
				questionIds = questionIds.slice(0, req.query.max)
			}
		}
	}

	console.log(questionIds)

	res.send(JSON.stringify(questionIds))
})

router.get("/question/:questionId", (req, res) => {
	// If the user isn't logged in, send an empty JSON body.
	if(!login.isValidSession(req))
	{
		res.send("{}")
		return
	}

	const question = getQuestion(req.params.questionId)
	if(question === undefined)
	{
		// If no question was received, send an empty JSON body.
		res.send("{}")
		return
	}

	return JSON.stringify(question)
})

module.exports.router = router
