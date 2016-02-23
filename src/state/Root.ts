
import { State, List } from 'lib/State';
import Todos from 'state/Todos';


interface IRoot {
	Todos: Todos;
}


export default class Root
	extends State<IRoot>
{

	constructor() {
		super({
			Todos: new Todos()
		});
	}

	public get Todos( ):Todos {
		return this.values.Todos;
	}

}
