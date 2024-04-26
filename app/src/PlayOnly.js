import { useContext } from "react"
import QuizContext from "./QuizContext.js"

const PlayOnly = ({children}) => {
	const ctx = useContext(QuizContext)

	return !ctx.isEditing ? (
		<div>
			{children}
		</div>
	) : null
}

export default PlayOnly
