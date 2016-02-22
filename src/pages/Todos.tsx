
import * as React from 'react';
import { Dispatch } from 'redux';
import { isNumber, some } from 'underscore';
import { State as libState } from 'lib/State';
import IconButton from 'components/IconButton';
import { renderWithStylesheet } from 'components/Stylesheet';
import Global from 'state/Global';
import { ITodo, Todos } from 'state/Todos';


interface Props
	extends React.Props<TodosPage>
{
	dispatch: Dispatch;
	todos: Todos;
}


interface State {
	selection?: number;
	new_input?: string;
}


interface Styles {
	todoList: string;
	todoItem: string;
	selected: string;
	done: string;
}


export class TodosPage
	extends React.Component<Props, State>
{

	constructor( props:Props ) {
		super( props );
		this.state = {
			new_input: ''
		};
	}

	private get canSaveInput( ):boolean {
		let can = !!this.state.new_input.trim();
		if (isNumber( this.state.selection ))
			can = can && (this.props.todos.get( this.state.selection ).name !== this.state.new_input.trim());
		return can;
	}

	private ClearState( ):void {
		this.setState({
			selection: null,
			new_input: ''
		});
	}

	private SaveInput( fev:React.FormEvent ):void {
		const selection = this.state.selection;
		const name = this.state.new_input.trim();
		this.ClearState();
		if (isNumber( selection ))
			this.props.dispatch( this.props.todos.setName( selection, name ));
		else
			this.props.dispatch( this.props.todos.Append({ name }));
	}

	render() {
		return renderWithStylesheet<Styles>(
			require( 'styles/pages/Todos.css' ),
			locals => (
				<div className={ [ 'panel', locals.todoList ].join( ' ' ) }>
					<h3>To do or not to do...</h3>
					<ul className='panel raised'>{
						this.props.todos.map( this.renderTodo.bind( this, locals ))
					}</ul>
					<form onSubmit={ fev => {
						fev.preventDefault();
						if (this.canSaveInput)
							this.SaveInput( fev );
					}}>
						<label>
							{ isNumber( this.state.selection )
								? `Item ${this.state.selection + 1}:`
								: 'New:' }
							<input
								id='new-name' type='text' name='name'
								value={ this.state.new_input }
								onChange={ e => this.setState({ new_input: (e.target as HTMLInputElement).value }) }/>
						</label>
						<IconButton
							title='Save'
							fa_class='check-square-o'
							disabled={ !this.canSaveInput }
							onClick={ this.SaveInput.bind(this) }
						/>
						<IconButton
							title='Delete'
							fa_class='times'
							disabled={ !isNumber( this.state.selection ) }
							onClick={ mev => {
								this.props.dispatch( this.props.todos.Remove( this.state.selection ));
								this.ClearState();
							}}
						/>
						<IconButton
							title='Cleanup'
							fa_class='trash-o'
							disabled={ !this.props.todos.any( item => item.done ) }
							onClick={ mev => {
								this.ClearState();
								const completed = this.props.todos
									.map( ( item, index ) => ({ item, index }) )
									.filter( desc => desc.item.done )
									.map( desc => desc.index );
								while (completed.length) {
									this.props.dispatch( this.props.todos.Remove( completed.pop() ));
								}
							}}
						/>
					</form>
				</div>
			)
		);
	}

	renderTodo( locals:Styles, todo:ITodo, index:number) {
		return (
			<li
				className={
					[ locals.todoItem,
						(this.state.selection === index) ? locals.selected : null,
						todo.done ? locals.done : null
					].join( ' ' ).trim()
				}
				key={ index }
				onClick={ mev => {
					const selection:number = (this.state.selection !== index) ? index : null;
					this.setState({
						selection,
						new_input: isNumber( selection )
							? todo.name
							: ''
					});
				}}
			>
				<input
					type='checkbox' name='done' checked={ todo.done }
					onChange={ fev => {
						this.props.dispatch( this.props.todos.Set(
							index, {
								name: todo.name,
								done: !todo.done
							}
						));
					}}
					onClick={ mev => {
						mev.stopPropagation();
					}}
				/>
				<span>{ todo.name }</span>
			</li>
		);
	}

}


export default libState.connect<Global, Props>( global => ({ todos: global.Todos }), TodosPage );
