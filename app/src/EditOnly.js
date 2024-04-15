import { useContext } from "react"
import QuizContext from "./QuizContext.js"

const EditOnly = ({children}) => {
	const ctx = useContext(QuizContext)

	return ctx.isEditing ? (
		<div>
			{children}
		</div>
	) : null
}

export default EditOnly
