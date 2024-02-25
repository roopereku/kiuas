import { useState, useEffect } from "react"
import { TextField } from "@react-md/form"

const QuizView = ({selected}) => {
	const [quizName, setQuizName] = useState(selected.name)
	const [questionIds, setQuestionIds] = useState([])

	useEffect(() => {
		fetch("api/quiz/question/getids/" + selected.id)
			.then((res) => res.json())
			.then((ids) => {
				console.log(ids)
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
		</div>
	)
}

export default QuizView
