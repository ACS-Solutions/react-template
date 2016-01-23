
import * as React from 'react';
import * as Redux from 'redux';
import * as _ from 'underscore';

import { Immutable, ImmutableList, isImmutable } from 'lib/Immutable';

const _create = require( 'underscore' ).create
const storeShape = require( 'react-redux/lib/utils/storeShape' );


export interface StateConstructor<TState extends State<any>> {
	new( values?:any ):TState;
}


export class State<TValues> {

	private _path:string[];
	private _values:any;

	private static empty_path = ImmutableList<string>();

	constructor( values?:TValues ) {
		this._path = State.empty_path;
		this._values = values || { };
	}

	public static connect<
		TState extends State<any>,
		TProps extends { dispatch: Redux.Dispatch }
	>(
		mapStateToProps:( root:TState ) => any,
		component:React.ComponentClass<TProps>
	):React.ComponentClass<TProps>
	{
		class Wrapper
			extends React.Component<TProps, TProps>  // relays some, provides some
		{

			private unsubscribeStore: Function;

			constructor( props, context ) {
				super( props, context );
				this.state = this.computeState( context );
			}

			static get contextTypes() {
				return {
					store: storeShape
				};
			}

			public get dispatch( ):Redux.Dispatch {
				return this.store.dispatch;
			}

			private get store( ):Redux.Store {
				return (this.context as any).store;
			}

			componentWillMount() {
				console.log( 'Wrapper.componentDidMount()', { context: this.context });
				this.subscribeStore();
			}

			componentWillUnmount() {
				console.log( 'Wrapper.componentWillUnmount()', { context: this.context });
				if (this.unsubscribeStore) {
					this.unsubscribeStore();
					this.unsubscribeStore = null;
				}
			}

			render() {
				console.log( 'Wrapper.render()', { context: this.context, props: this.props, state: this.state });
				const merged_props = _.extend(
					{ dispatch: this.store.dispatch },
					this.props,
					this.state
				) as TProps;
				return React.createElement( component, merged_props );
			}

			private computeState( context ) {
				const app_state = context.store.getState().application;
				return mapStateToProps( app_state );
			}

			private updateState( ) {
				const mapped_state = this.computeState( this.context );
				const states_equal = _.every(
					_.union( _.keys( mapped_state ), _.keys( this.state )),
					( key ) => mapped_state[key] === this.state[key]
				);
				if (!states_equal) {
					console.log( 'Wrapper.updateState()', { states_equal } );
					this.setState( mapped_state );
				}
			}

			private subscribeStore() {
				if (!this.unsubscribeStore) {
					this.unsubscribeStore = ((this.context as any).store as Redux.Store).subscribe(() => {
						if (this.unsubscribeStore)
							this.updateState();
					});
					this.updateState();
				}
			}

		}
		return Wrapper as any as React.ComponentClass<TProps>;
	}

	public static reducer<TState extends State<any>>( cstate:StateConstructor<TState> ):Redux.Reducer {
		return ( state:any, action:{ type:string, payload:any } ) => {
			return log( "State::reducer()", () => {
				// decode path
				const path = _.isString( action.type )
					? action.type.split( '/' )
					: State.empty_path;
				// if 3 or more components, assume action is applicable
				if (3 <= path.length ) {
					// remove first, empty path component (representing root itself)
					path.shift();
					log( `Attempting action ${State.displayPath( path )}...` );
					// call recursive apply method on root State node; return returned State instance
					return state.applyRecursive( path, action.payload );
				} else
				// if state not yet initialised
				if (undefined === state) {
					log( "State is undefined, constructing and connecting..." );
					// instantiate root State node
					const new_state = new cstate();
					// invoke connect on root State node
					return new_state.connect( new_state.values, State.empty_path );
				}
				// return original state argument value by default
				return state;
			});
		};
	}

	private static nodeName( path:string[] ):string {
		return path[ path.length - 1 ];
	}

	private static displayPath( path:string[] ):string {
		return [ null ].concat( path ).join( '/' );
	}

	protected get values( ):Immutable<TValues> & TValues {
		return this._values;
	}

	public valuesEqual( values?:TValues ):boolean {
		if (this.values !== values) {
			for (var n in this.values)
				if (this.values[n] !== values[n])
					return false;
			for (var n in values)
				if (values[n] !== this.values[n])
					return false;
		}
		return true;
	}

	protected Action( member:string, method:string, payload?:any ):{} {
		const action = Immutable({
			type: [ null ].concat( this._path, member, method ).join( '/' ),
			payload
		});
		console.log( "Action", action );
		return action;
	}

	/**
	 * Applies an action against an optionally identified member of this State node.
	 * Derivaative classes must override the implementation to suit specific State requirements.
	 * @param {string} member  The member of this State node against which to perform the action. Optional.
	 * @param {string} method  The name of the action Method to be applied. Optional.
	 * @param {any} payload    The payload provided when the Action was dispatched.
	 * @return {TValues}       Implementors must return either the current State values or a modified copy (using immutable primitives).
	*/
	protected apply( member:string, method:string, payload:any ):TValues {
		return this.values;
	}


	/**
	 * Applies an Action against the tree of subordinate State nodes.
	 * Reintegrates changes to values back down to the tree root.
	 * @param {string[]} path  The node path through the State tree for which the Action is destined.
	 * @param {any} payload    The payload provded when the Action was dispatched.
	 * @return {State}         If final apply() returns new values, return clone of self with new values, otherwise return self.
	*/
	private applyRecursive( path:string[], payload:any ):State<TValues> {
		return log([
			"State.applyRecursive()",
			State.displayPath( path ),
			payload
		], () => {
			if (2 < path.length) {
				// action is for a subordinate State node
				const name = path[0];
				const original_substate = (this.values as any)[name];
				if (!(original_substate instanceof State))
					throw new Error( `Subvalue ${name} is not a State node` );
				// recurse
				const applied_substate = original_substate.applyRecursive( path.slice( 1 ), payload );
				// if substate has been updated...
				if (original_substate !== applied_substate) {
					log([ `Integrating changed substate...`, applied_substate ]);
					// update corresponding own  value
					const applied_values = (this instanceof List)
						// replace array item for List subclasses
						? (this.values as any as ImmutableList<any>).splice( name as any as number, 1, applied_substate )
						// replace dictionary entry for other State subclasses
						: (this.values as any as Immutable<any>).merge( _.object([ name ], [ applied_substate ]), false );
					// reduce
					return this.cloneWithValues( applied_values );
				} else
					return this;
			} else if (2 === path.length) {
				// only two components in path; action is for this State node
				const member = path[0];
				const method = path[1];
				log([ 'State.apply', member, method, payload ]);
				// apply action; expect updated values
				const values = this.apply( member, method, payload );
				// connect and reduce
				if (values !== this.values)
					log( "Values changed. Connecting and reducing..." );
				return (values !== this.values)
					? this.connect( values, this._path )
					: this;
			} else {
				throw new Error( `Unexpected number of path components` );
			}
		});
	}

	private cloneWithValues( values:any, path?:string[] ):State<TValues> {
		return log([ "State.cloneWithValues()", path || this._path, values ], () => {
			const prototype = Object.getPrototypeOf( this );
			const cloned_state = Immutable(
				_create( Object.getPrototypeOf( this ), {
					_path: path || this._path,
					_values: values
				})
			) as any as State<TValues>;
			if (!(cloned_state instanceof prototype.constructor)) {
				throw new Error( `State clone is not an instance of its original prototype` );
			}
			return cloned_state;
		});
	}

	/**
	 * Enumerate constituents of provided values to ensure 'connected' to State tree.
	 * @return {State<TValues>}  A copy of the current instance with values updated to reflect result of connection process.
	*/
	private connect( values:any, path:string[] ):State<TValues> {
		return log([ "State.connect()", values, path ], () => {
			const iteratee = ( value, name ) => {
				if (value instanceof State) {
					if (name !== State.nodeName( (value as State<any>)._path )) { // TODO: compute instead based on full path
						log( `Subvalue ${name} is not named; recursing...` );
						// value is a substate, not yet connected
						return (value as State<any>).connect( value.values, path.concat( name ));
					} else
						return value;
				} else if (_.isObject( value )) {
					log( `Subvalue ${name} is plain object` );
					return Immutable( value );
				} else {
					log( `Subvalue ${name} is ${typeof value}` );
					return value;
				}
			};
			values = (this instanceof List)
				? (values as any as any[]).map(( item, index ) => iteratee( item, index.toString() ))
				: _.mapObject( values, iteratee );
			return this.cloneWithValues( values, path );
		});
	}

}


export class List<TValue>
	extends State<TValue[]>
{

	constructor( values?:TValue[] ) {
		super(
			_.isArray( values )
				? values
				: [ ]
		);
	}

	public get length( ):number {
		return this.values.length;
	}

	public any( predicate:{ ( item:TValue, index:number ):boolean } ):boolean {
		return Array.prototype.some.call( this.values, predicate );
	}

	public forEach( cb:{ ( item:TValue, index:number ):void } ):void {
		Array.prototype.forEach.call( this.values, cb );
	}

	public filter( predicate:{ ( item:TValue, index:number ):boolean } ):TValue[] {
		return Array.prototype.filter.call( this.values, predicate );
	}

	public get( index:number ):TValue {
		return this.values[index];
	}

	public map( cb:( item:TValue, index:number ) => any ):any[] {
		return Array.prototype.map.call( this.values, cb );
	}

	public Append( item:TValue ):{} {
		return this.Action( null, 'add', item );
	}

	public Remove( index:number ):{} {
		return this.Action( null, 'remove', index );
	}

	public Set( index:number, item:TValue ):{} {
		return this.Action( null, 'set', { index, item } );
	}

	public valuesEqual( values?:TValue[] ):boolean {
		if (this.values === values)
			return true;
		if (!this.values || !values)
			return false;
		if (this.values && values && (this.values.length !== values.length))
			return false;
		return super.valuesEqual( values );
	}

	protected apply( member:string, method:string, payload:any ):TValue[] {
		switch (method) {
			case 'add':
				return this.values.concat( payload as TValue );
			case 'remove':
				const index = payload as number;
				return this.values.slice( 0, index ).concat( this.values.slice( index + 1 ));
			case 'set':
				return this.values.map(( item, index ) => (index === payload.index) ? payload.item : item );
		}
		return super.apply( member, method, payload );
	}

}


export class Map<TValue>
	extends State<{ [ key:string ]:TValue }>
{

	constructor( values?:{ [ key:string ]:TValue } ) {
		super( values );
	}

	public get count( ):number {
		return _.keys( this.values ).length;
	}

	public getValue( key:string ) {
		return this.values[ key ];
	}

	public listValues( ):TValue[] {
		return _.values( this.values );
	}

	public MergeValues( values?:{ [ key:string ]:TValue } ):{} {
		return this.Action( 'values', 'merge', values );
	}

	public RemoveKeys( keys?:string[] ):{} {
		return this.Action( 'values', 'remove', keys );
	}

	protected apply( member:string, method:string, payload:any ) {
		switch (member) {
			case 'values':
				if ( !payload )
					break;
				switch (method) {
					case 'merge':
						return this.values.merge( payload );
					case 'remove':
						return this.values.without( ...payload );
				}
				break;
		}
		return super.apply( member, method, payload );
	}

}


function log( message?:string, content?:Function ):any;
function log( message?:any[], content?:Function ):any;
function log( message?:any, content?:Function ):any {
	//return content && content();
	if (!!message || !!content) {
		if (!!content) {
			let ret;
			try {
				if (message instanceof Array)
					console.group.apply( console, message );
				else
					console.group( message );
				ret = content();
			} finally {
				console.groupEnd();
				console.log( ret );
			}
			return ret;
		} else {
			if (message instanceof Array)
				console.log.apply( console, message );
			else
				console.log( message );
		}
	}
}
