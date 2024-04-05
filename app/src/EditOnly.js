import { useContext } from "react"
import EditContext from "./EditContext.js"

const EditOnly = ({children}) => {
	const isEditing = useContext(EditContext)

	return isEditing ? (
		<div>
			{children}
		</div>
	) : null
}

export default EditOnly
