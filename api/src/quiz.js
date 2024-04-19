const crypto = require("crypto")
const express = require("express")
const cookieParser = require("cookie-parser")

const login = require("./login.js")
const edit = require("./edit.js")
const db = require("./database.js")

const router = express.Router()
router.use(cookieParser())

const isValidRevision = (revisionId) => {
	// TODO: Get this from the database.
	return true
}

router.get("/listings", (req, res) => {
	// If the user isn't logged in, send an empty array.
	if(!login.isValidSession(req))
	{
		res.send("[]")
		return
	}

	// Get all revisions that this user has access to.
	db.query("SELECT id, quizid FROM revision WHERE $1 = ANY(authorized)", [ login.getUsername(req) ])
		.then((rows) => {

			// Get the quizzes that the returned revisions belong to.
			db.query("SELECT id, name, category FROM quiz WHERE id = ANY($1)", [ rows.map((row) => row.quizid) ])
				.then((quizRows) => {

					// Filter out any irrelevant information.
					const listings = quizRows.map((quizRow) => {
						return {
							category: quizRow.category,
							name: quizRow.name,

							// Associate the returned quizzes with accessible revisions.
							revisions: rows.filter((row) => {
								return row.quizid === quizRow.id
							}).map((revision) => revision.id)
						}
					})

					res.send(JSON.stringify(listings))
				})
		})
})

router.get("/question/:questionId", (req, res) => {
	// If the user isn't logged in, send an empty JSON body.
	if(!login.isValidSession(req))
	{
		res.send("{}")
		return
	}

	db.query("SELECT question, image FROM question WHERE id = $1", [ req.params.questionId ])
		.then((rows) => {
			console.log("Question is", rows)
			if(rows.length > 0)
			{
				res.send(JSON.stringify({
					question: rows[0].question,
					image: rows[0].image
				}))
			}

			else
			{
				res.send("{}")
			}
		})
})

// Returns the ID for question for every question within the given revision of a quiz.
router.get("/quizdata/:revisionId", (req, res) => {
	// If the user isn't logged in, send an empty JSON body.
	if(!login.isValidSession(req))
	{
		res.send("{}")
		return
	}

	// Get IDs of questions for the given revision if the requester has access to them.
	db.query("SELECT questions, quizId FROM revision WHERE id = $1 AND $2 = ANY(authorized)",
			[ req.params.revisionId, login.getUsername(req) ])
		.then((rows) => {
			if(rows.length > 0)
			{
				const questionIds = rows[0].questions
					.map(id => ({ id , sort: Math.random() }))
					.sort((a, b) => a.sort - b.sort)
					.map(({ id }) => id)

				// If a max question amount is given, cut the ID array.
				if("max" in req.query)
				{
					if(questionIds.length >= req.query.max)
					{
						questionIds = questionIds.slice(0, req.query.max)
					}
				}

				// Get the name of the quiz.
				db.query("SELECT name, category FROM quiz WHERE id = $1", [ rows[0].quizid ])
					.then((rows) => {
						res.send(JSON.stringify({
							name: rows[0].name,
							category: rows[0].category,
							questions: questionIds
						}))
					})
			}

			else
			{
				res.send("{}")
			}
		})
})

module.exports.router = router
