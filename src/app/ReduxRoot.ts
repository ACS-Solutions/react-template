
import AppRoot from 'state/Root';

export interface IReduxRoot {
	app: AppRoot;
	routing: any;  // opaque
}

export default IReduxRoot;
