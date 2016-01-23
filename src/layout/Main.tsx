
import * as React from 'react';
import Navbar from 'components/Navbar';


import 'styles/global/app.css';


export default class Main
	extends React.Component<React.Props<Main>, void>
{

	render() {
		return (
			<div className='appmain'>
				<Navbar />
				{ this.props.children }
			</div>
		);
	}

}
