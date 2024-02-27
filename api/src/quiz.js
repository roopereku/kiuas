const crypto = require("crypto")
const express = require("express")
const cookieParser = require("cookie-parser")

const login = require("./login.js")
const edit = require("./edit.js")

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
		category: "Cat2"
	},
	"quizid3": {
		name: "Test Quiz 3",
		category: "long category name"
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

const getQuestionIds = (req) => {
	if(isValidQuiz(req.params.quizId))
	{
		const ids = []

		for(let i = 0; i < 50; i++)
		{
			ids.push("que" + i.toString())
		}

		// TODO: Get this from the database.
		return ids
	}

	return {}
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

// Returns the ID for question for every question within the given revision of a quiz.
router.get("/questionids/:quizId/:revision", (req, res) => {
	// If the user isn't logged in, send an JSON body.
	if(!login.isValidSession(req))
	{
		res.send("{}")
		return
	}

	// Get data of every question in the given quiz.
	let questionIds = getQuestionIds(req)

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

	res.send(JSON.stringify(questionIds))
})

module.exports.router = router
