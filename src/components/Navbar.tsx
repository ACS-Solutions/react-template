
import { Component, Props } from 'react';
import { Link } from 'react-router';
import { renderWithStylesheet } from 'components/Stylesheet';


interface Styles {
	nav: string;
}


export default class Navbar
	extends Component<Props<Navbar>, void>
{

	render() {
		return renderWithStylesheet<Styles>(
			require( 'styles/components/Navbar.css' ),
			locals => (
				<nav className={ [ 'panel', locals.nav ].join( ' ' ) }>
					<Link className='button' activeClassName='active' to='/'>/</Link>
					<Link className='button' activeClassName='active' to='/todo'>Todos</Link>
				</nav>
			)
		);
	}

}
