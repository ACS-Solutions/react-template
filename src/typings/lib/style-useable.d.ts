
declare interface IUsableStyle<T extends {}> {
	locals: T & { [name:string]:string };
	use( ):void;
	unuse( ):void;
}
