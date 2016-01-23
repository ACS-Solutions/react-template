
import Link from 'react-router/lib/Link';
import StyledComponent from 'components/StyledComponent';


interface Styles {
	nav: string;
}


export default class Navbar
	extends StyledComponent<Styles, React.Props<void>, void>
{

	get UsableStyles() { return require( 'styles/components/Navbar.css' ); }

	render() {
		return (
			<nav className={ [ 'panel', this.LocalStyles.nav ].join( ' ' ) }>
				<Link className='button' activeClassName='active' to='/'>/</Link>
				<Link className='button' activeClassName='active' to='/todo'>Todos</Link>
			</nav>
		);
	}

}
