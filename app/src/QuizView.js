import { useState, useEffect } from "react"
import { TextField } from "@react-md/form"

import QuestionView from "./QuestionView.js"

const QuizView = ({selected}) => {
	const [quizName, setQuizName] = useState(selected.name)
	const [questionIds, setQuestionIds] = useState([])
	const [currentQuestion, setCurrentQuestion] = useState({})

	useEffect(() => {
		// TODO: Get revision from QuizSelector.
		fetch("api/quiz/questionids/" + selected.id + "/XXXX")
			.then((res) => res.json())
			.then((ids) => {
				setQuestionIds(ids)
			})
	}, [])

	const getQuestion = (id) => {
	}

	return (
		<div>
			{selected.isEditing ?
				(
					<TextField value={quizName} onChange={(e) => setQuizName(e.target.value)} />
				) :
				(
					<p>
						{selected.name}
					</p>
				)
			}

			{}
		</div>
	)
}

export default QuizView
