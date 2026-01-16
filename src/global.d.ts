// Type declarations for static asset imports used in this project
declare module '*.css' {
	const classes: { readonly [key: string]: string };
	export default classes;
}
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.webp';

export {};
