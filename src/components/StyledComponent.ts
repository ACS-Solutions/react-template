
import * as React from 'react';


export class StyledComponent<TLocals, TProps, TState>
	extends React.Component<TProps, TState>
{

	protected get UsableStyles( ):IUsableStyle<TLocals> {
		throw new Error( 'Not Implemented' );
	}

	protected get LocalStyles( ):TLocals {
		return this.UsableStyles.locals;
	}

	componentWillMount() {
		this.UsableStyles.use();
	}

	componentWillUnmount() {
		setTimeout( () => this.UsableStyles.unuse() );
	}

}

export default StyledComponent;
