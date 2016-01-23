
import * as React from 'react';
import { Link } from 'react-router';
import StyledComponent from 'components/StyledComponent';


interface Props
	extends React.Props<IconButton>
{
	fa_class: string;
	to?: string;
	color?: string;
	disabled?: boolean;
	onClick?: React.MouseEventHandler;
	title?: string;
}


interface Styles {
	buttonClass: string;
	disabled: string;
}


export class IconButton
	extends StyledComponent<Styles, Props, void>
{

	get UsableStyles() { return require( 'styles/components/IconButton.css' ); }

	render() {
		return (
			<Link
				className={[
					this.LocalStyles.buttonClass,
					'fa',
					'fa-' + this.props.fa_class,
					this.props.disabled ? this.LocalStyles.disabled : null
				].join( ' ' ).trim() }
				disabled={ this.props.disabled }
				style={ !this.props.disabled && this.props.color && { color: this.props.color } || null }
				title={ this.props.title }
				to={ this.props.to || '' }
				onClick={ mev => {
					if (this.props.disabled || !this.props.to)
						mev.preventDefault();
					if (!this.props.disabled && this.props.onClick)
						setTimeout(() => this.props.onClick( mev ), 50);  // brief delay for that comfortable 'pop back up' feel
				}}
			/>
		);
	}

}

export default IconButton;
