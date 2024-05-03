const crypto = require("crypto")
const express = require("express")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

const login = require("./login.js")
const edit = require("./edit.js")
const db = require("./database.js")

const router = express.Router()
router.use(cookieParser())
router.use(bodyParser.json())

const isValidRevision = (revisionId) => {
	// TODO: Get this from the database.
	return true
}

const normalizeAnswer = (value) => {
	return value
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

router.get("/quizinfo/:revisionId", (req, res) => {
	// If the user isn't logged in, send an empty JSON body.
	if(!login.isValidSession(req))
	{
		res.send("{}")
		return
	}

	db.query("SELECT name, category FROM quiz WHERE id = (SELECT quizid FROM revision WHERE id = $1)",
			[ req.params.revisionId ])
		.then((rows) => {
			if(rows.length > 0)
			{
				res.send(JSON.stringify({
					name: rows[0].name,
					category: rows[0].category
				}))
			}

			else
			{
				res.send("{}")
			}
		})
})

router.get("/quizdata/:revisionId", (req, res) => {
	// If the user isn't logged in, send an empty JSON body.
	if(!login.isValidSession(req))
	{
		res.send("{}")
		return
	}

	// Get IDs of questions for the given revision if the requester has access to them.
	db.query("SELECT questions FROM revision WHERE id = $1 AND $2 = ANY(authorized)",
			[ req.params.revisionId, login.getUsername(req) ])
		.then((rows) => {
			if(rows.length > 0)
			{
				// Shuffle the returned questions.
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

				// Get the questions that have been selected.
				db.query("SELECT id, elements FROM question WHERE id = ANY($1)", [ questionIds ])
					.then((rows) => {
						const questions = []

						// For each question, get the elements.
						// TODO: Get random answers when multiple selection gamemode is implemented.
						rows.forEach((row) => {
							db.query("SELECT type, value, image FROM element WHERE id = ANY($1)",
								[ row.elements ])
								.then((elements) => {
									questions.push({
										id: row.id,
										elements: elements.map((e) => {
											// TODO: Only show one answer text field?
											//  Need to think about the case where there
											//  are multiple answers and all of them have images.

											// TODO: Don't clear the answers when in card mode?

											// Clear the answer text fields.
											if(e.type === "answer")
											{
												e.value = ""
											}

											return e
										})
									})

									// When all questions have been collected, send the result.
									if(questions.length === questionIds.length)
									{
										res.send(JSON.stringify(questions))
									}
								})
						})
					})
			}

			else
			{
				res.send("{}")
			}
		})
})

router.post("/check/:questionId", (req, res) => {
	if(!login.isValidSession(req) || !("guess" in req.body))
	{
		res.send("{}")
		return
	}

	// TODO: Make sure that the requester has access to the question.

	// Get all answers that are associated with this question.
	db.query("SELECT value FROM element WHERE TYPE = 'answer' AND id IN (SELECT unnest(elements) FROM question WHERE id = $1)",
			[ req.params.questionId ])
		.then((rows) => {
			const results = []

			if(rows.length > 0)
			{
				// Match every guess against every possible answer.
				req.body.guess.forEach((value) => {
					const normalized = normalizeAnswer(value)
					let correct = false

					// TODO: Keep normalized answers in the database?
					for(const i in rows)
					{
						if(normalized === normalizeAnswer(rows[i].value))
						{
							correct = true
							break
						}
					}

					results.push(correct)
				})
			}

			res.send(JSON.stringify({
				result: results
			}))
		})
})

module.exports.router = router
