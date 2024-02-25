import { ExpansionList, ExpansionPanel, usePanels, } from "@react-md/expansion-panel"
import { Dialog, DialogContent, DialogFooter } from "@react-md/dialog"
import { Select, useSelectState } from "@react-md/form"
import { Button } from "@react-md/button";
import { TextIconSpacing } from "@react-md/icon"
import { CreateSVGIcon, InsertPhotoSVGIcon } from "@react-md/material-icons"
import { useState, useEffect } from "react"
import QuizListing from "./QuizListing.js"
import "./QuizSelector.css"

const QuizSelector = () => {
	const [shouldUpdateListings, setShouldUpdateListings] = useState(false)
	const [categories, setCategories] = useState([])
	const [expanded, setExpanded] = useState([])

	const [infoVisible, setInfoVisible] = useState(false)
	const [currentInfo, setCurrentInfo] = useState({})

	const [revision, handleRevisionChange] = useSelectState("nii")
	const [revisionOptions, setRevisionOptions] = useState([])

	const showListingInfo = (id, name) => {
		setCurrentInfo({
			id: id,
			name: name
		})

		// TODO: Get this from the backend.
		setRevisionOptions([
			"Rev1", "Rev2", "Rev3"
		])

		setInfoVisible(true)
	}

	const hideListingInfo = () => {
		setInfoVisible(false)
	}

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
							return (
								<QuizListing
									key={listing.id}
									name={listing.name}
									id={listing.id}
									showListingInfo={showListingInfo}
								/>
							)
						})}
						</ExpansionPanel>
					)
				})}
			</ExpansionList>

			<Dialog
				id="listing-dialog"
				role="alertdialog"
				modal={true}
				visible={infoVisible}
				aria-labelledby="listing-dialog-title"
			>
				<DialogContent>
					<h3>{currentInfo.name}</h3>

					<Select
						label="Select revision"
						name="selectRevision"
						value={revision}
						options={revisionOptions}
						onChange={handleRevisionChange}
					/>

					<div id="playButtons">
						<p>Play</p>

						<Button themeType="contained" theme="primary">
							<TextIconSpacing icon={<CreateSVGIcon />}>
								Type
							</TextIconSpacing>
						</Button>

						<Button themeType="contained" theme="primary">
							<TextIconSpacing icon={<InsertPhotoSVGIcon />}>
								Card
							</TextIconSpacing>
						</Button>
					</div>
				</DialogContent>

				<DialogFooter>
					<Button
						onClick={hideListingInfo}
						theme="primary"
					>
						Close
					</Button>
				</DialogFooter>
			</Dialog>
		</div>
	)
}

export default QuizSelector
