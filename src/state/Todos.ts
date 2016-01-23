
import { List } from 'lib/State';


export interface ITodo {
	done?: boolean;
	name: string;
}


export class Todos
	extends List<ITodo>
{

	constructor() {
		super([
			{ done: true, name: 'Default thing done' },
			{ name: 'Default thing to do' }
		]);
	}

	public setName( index:number, name:string ):{} {
		return super.Set( index, { done: this.values[index].done, name });
	}

}


export default Todos;
