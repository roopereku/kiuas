import { Button } from "@react-md/button";
import "./QuizListing.css"

const QuizListing = ({name, id, showListingInfo}) => {
	const displayInfo = () => {
		showListingInfo(id, name)
	}

	return (
		<div className="listingDiv">
			<Button themeType="contained" onClick={displayInfo}>
				{name}
			</Button>
		</div>
	)
}

export default QuizListing
