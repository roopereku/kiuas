import { useState } from "react"
import { Layout, useLayoutNavigation } from 'react-md'
import "./App.css"
import "./App.scss"

import LoginChecker from "./Login.js"
import QuizSelector from "./QuizSelector.js"

const navItems = {};

function App()
{
	const [ loginDone, setLoginDone ] = useState(false)

	return (
		<Layout
		 title="react-md App"
		 navHeaderTitle="My App"
		 treeProps={useLayoutNavigation(navItems, window.location.pathname)}>

			<div className="App">
				<header className="App-header">
					{!loginDone ?
						(<LoginChecker setLoginDone={setLoginDone} />) :
						(<QuizSelector />)
					}
				</header>
			</div>
		</Layout>	
	);
}

export default App;
