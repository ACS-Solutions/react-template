
import { State, List } from 'lib/State';
import Todos from 'state/Todos';


interface IGlobal {
	Todos: Todos;
}


export default class Global
	extends State<IGlobal>
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
