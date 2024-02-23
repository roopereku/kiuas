import { ExpansionList, ExpansionPanel, usePanels, } from "@react-md/expansion-panel";
import { useState, useEffect } from "react"
import QuizListing from "./QuizListing.js"
import "./QuizSelector.css"

const QuizSelector = () => {
	const [shouldUpdateListings, setShouldUpdateListings] = useState(false)
	const [categories, setCategories] = useState([])
	const [expanded, setExpanded] = useState([])

	useEffect(() => {
		setShouldUpdateListings(false)

		// Request the quiz listings.
		fetch("api/quiz/listings")
			.then((res) => res.json())
			.then((listingsData) => {
				const newCategories = []
				const newExpanded = []
				const categoryLookup = {}

				listingsData.forEach((listing) => {
					// If the given category doesn't exist, create it.
					if(!(listing.category in categoryLookup))
					{
						categoryLookup[listing.category] = newCategories.length

						newCategories.push({
							id: "category-" + newCategories.length,
							name: listing.category,
							index: newCategories.length,
							children: [],
							expanded: false
						})

						newExpanded.push(false)
					}

					newCategories[categoryLookup[listing.category]].children.push(listing)
				})

				setCategories(newCategories)
				setExpanded(newExpanded)
			})
	}, [shouldUpdateListings])

	return (
		<div>
			<h1>Listings</h1>

			<ExpansionList>
				{categories.map((category) => {
					return (
						<ExpansionPanel
							key={category.id}
							header={category.name}
							expanded={expanded[category.index]}
							onExpandClick={() => {
								setExpanded(categories.map((entry) => {
									return entry.index == category.index
								}))
							}}
						>
						{category.children.map((listing) => {
							return <QuizListing key={listing.id} name={listing.name} />
						})}
						</ExpansionPanel>
					)
				})}
			</ExpansionList>
		</div>
	)
}

export default QuizSelector
