
import * as React from 'react';


interface Props {
	status?: number;
}


export class NotFound
	extends React.Component<Props, void>
{

	render() {
		return (
			<h1>Content Not Found</h1>
		);
	}

}

export default NotFound;
