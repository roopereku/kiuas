import "./QuizListing.css"

const QuizListing = ({name}) => {
	return (
		<div className="listingDiv">
			<p>
				{name}
			</p>
		</div>
	)
}

export default QuizListing
