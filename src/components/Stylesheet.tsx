
import * as React from 'react';


export interface StyleProps<TLocals>
	extends React.Props<Stylesheet<TLocals>>
{
	usable?: IUsableStyle<TLocals>;
	withStyle?: ( locals:TLocals ) => any;
}


export class Stylesheet<TLocals>
	extends React.Component<StyleProps<TLocals>, void>
{

	public get locals( ):TLocals {
		return this.stylesheet.locals;
	}

	private get stylesheet( ):IUsableStyle<TLocals> {
		return this.props.usable;
	}

	componentWillMount() {
		this.stylesheet.use();
	}

	componentWillUnmount() {
		setTimeout( () => this.stylesheet.unuse() );
	}

	render( ):any {
		if (this.props.withStyle) {
			return this.props.withStyle( this.locals );
		} else {
			return (1 < React.Children.count( this.props.children ))
				? <div>...{ this.props.children }</div>
				: this.props.children;
		}
	}

}


export default Stylesheet;


export function renderWithStylesheet<TLocals>( usable:IUsableStyle<TLocals>, withStyle:( locals:TLocals ) => any ) {
	return React.createElement( Stylesheet, { usable, withStyle });
}
