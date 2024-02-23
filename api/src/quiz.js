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

module.exports.router = router
