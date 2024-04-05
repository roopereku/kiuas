import { useContext, useState, useEffect } from "react"
import { TextField } from "@react-md/form";
import EditContext from "./EditContext.js"

const QuizElement = ({data, onEdit}) => {
	const isEditing = useContext(EditContext)
	const [ textValue, setTextValue ] = useState("")

	useEffect(() => {
		setTextValue(data.initialValue)
	}, [data])

	return isEditing ?
	(
		<TextField
			value={textValue}
			onChange={(e) => {
				setTextValue(e.target.value)
				onEdit(e.target.value)
			}}
		/>
	) :
	(
		<p>{textValue}</p>
	)
}

export default QuizElement
