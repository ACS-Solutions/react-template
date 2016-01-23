
import * as React from 'react';
import { map, sortBy } from 'underscore';
import StyledComponent from 'components/StyledComponent';


interface ColumnSpec<TValue> {
	heading?: (string | React.ReactElement<any>);
	className?: string;
	render: ( item:TValue ) => (string | React.ReactElement<any>);
	comparison?: ( l:TValue, t:TValue ) => number;
}


interface Props<TValue> {
	className?: string;
	columns: ColumnSpec<TValue>[];
	values: TValue[];
	default_sort?: number;
	onClick?: ( item:TValue ) => void;
}


interface State {
	sort?: number;
}


interface Styles {
	table: string;
	clickable: string;
	sortable: string;
}


export class ListView<TValue>
	extends StyledComponent<Styles, Props<TValue>, State>
{

	constructor( props:Props<TValue> ) {
		super( props );
		this.state = {
			sort: props.default_sort
		};
	}

	get UsableStyles() { return require( 'styles/components/Table.css' ); }

	render() {
		return React.DOM.table({
			className: [
				this.props.className,
				this.LocalStyles.table
			].join( ' ' )
		},
			React.DOM.thead( null,
				React.DOM.tr( null, ...map(
					this.props.columns,
					( column, column_index ) => React.DOM.th({
						className: [
							column.className,
							column.comparison && this.LocalStyles.sortable || undefined
						].join( ' ' ),
						onClick: column.comparison && (() => this.sortColumn( column_index + 1 ))
					}, column.heading )
				))
			),
			React.DOM.tbody({
				className: this.props.onClick && this.LocalStyles.clickable
			}, ...map(
				this.sortValues( this.props.values ),
				item => React.DOM.tr({
					onClick: this.props.onClick && (() => this.props.onClick( item ))
				}, ...map(
					this.props.columns,
					column => React.DOM.td({ className: column.className }, column.render( item ))
				))
			))
		);
	}

	private sortColumn( column_no:number ) {
		var sort = this.state.sort;
		var sort_col = Math.abs( sort );
		if (column_no === sort_col)
			sort = -sort;
		else
			sort = column_no;
		this.setState({ sort });
	}

	private sortValues( values:TValue[] ):TValue[] {
		const sort = this.state.sort;
		if (sort) {
			values = Array.prototype.slice.call( values );
			const column_index = Math.abs( sort ) - 1;
			const columnComparison = this.props.columns[column_index].comparison;
			const comparison = (sort < 0)
				? (( l, r ) => columnComparison( r, l ))
				: columnComparison;
			Array.prototype.sort.call( values, comparison );
		}
		return values;
	}

}

export default ListView;


export function renderTable<TValue>( props:Props<TValue> ):React.ReactElement<Props<TValue>> {
	return React.createElement( ListView, props );
}
