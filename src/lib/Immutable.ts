
const immutable = require ( 'seamless-immutable' );
import { isArray } from 'underscore';


export interface Immutable<T> {
	asMutable( ):T;
	merge( values:T, deep?:boolean ):Immutable<T> & T;
	merge( values:T[] ):Immutable<T> & T;
	without( ...keys:string[] ):Immutable<T> & T;
}


export interface ImmutableList<T>
	extends Array<T>
{
	asMutable( ):T[];
}


type ImmutableObject<T> = Immutable<T> & T;


type ImmutableArray<T> = Array<T> & ImmutableList<T>;


export function Immutable<T>( values?:T ):ImmutableObject<T> {
	return immutable( values );
}


export function ImmutableList<T>( values?:T[] ):ImmutableArray<T> {
	return immutable(
		isArray( values )
			? values
			: [ ]
	);
}


export function isImmutable( o:any ):boolean {
	return immutable.isImmutable( o );
}
