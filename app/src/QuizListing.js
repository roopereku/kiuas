import { Button } from "@react-md/button";
import "./QuizListing.css"

const QuizListing = ({data, showListingInfo}) => {
	const displayInfo = () => {
		showListingInfo(data.name, data.revisions)
	}

	return (
		<div className="listingDiv">
			<Button themeType="contained" onClick={displayInfo}>
				{data.name}
			</Button>
		</div>
	)
}

export default QuizListing
