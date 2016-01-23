
const contentType = require( 'content-type' );
import { extend } from 'underscore';


export interface PayloadResponse<T>
	extends Response
{
	payload?: T;
}


export interface IFetchParams {
	url: string;
	method?: string;
	url_base?: string;
	payload?: any;
	auth_token?: string;
}


/**
Simple wrapper to issue AJAX requests, returning a Promise representing the asynchronous operation.
If url_base is specified and url appears to be relative, the URL used will be a concatenation of url_base, a forward slash, and url.
If method is not specified, it defaults to 'post' if payload is provided, 'get' otherwise.
Request payload, if present, will be translated to JSON.
*/
export function apiFetch( params:IFetchParams ):Promise<Response> {
	const method = params.method || (params.payload ? 'post' : 'get');
	const url = (params.url_base && !params.url.startsWith( 'http' ))
		? params.url_base + '/' + params.url
		: params.url;
	const headers = new Headers();
	headers.append( 'Accept', 'application/json' );
	if (params.payload)
		headers.append( 'Content-Type', 'application/json' );
	if (params.auth_token)
		headers.append( 'Authorization', 'Basic ' + params.auth_token );
	return fetch( url, {
		method,
		headers,
		body: params.payload && JSON.stringify( params.payload ),
		credentials: 'include'
	});
}


export function apiFetchJson<T>( params:IFetchParams ):Promise<PayloadResponse<T>> {
	return apiFetch( params ).then( response => maybeParseJson<T>( response ));
}


export function apiFetchBlob( params:IFetchParams ):Promise<PayloadResponse<Blob>> {
	return apiFetch( params )
		.then( response => response.blob()
			.then( blob => Promise.resolve( responseWithPayload( response, blob )))
		);
}


function maybeParseJson<T>( response:Response ):Promise<PayloadResponse<T>> {
	const content_type = response.headers.has( 'Content-Type' ) && contentType.parse( response.headers.get( 'Content-Type' ));
	const is_json = ('application/json' === content_type.type);
	return is_json
		? response.json().then( json => responseWithPayload( response, json ))
		: Promise.resolve( response );
}


function responseWithPayload<T>( response:Response, payload:T ):PayloadResponse<T> {
	const resp = response as PayloadResponse<T>;
	resp.payload = payload;
	return resp;
}
