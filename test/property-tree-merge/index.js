'use strict';

const propertyTreeMerge = require( '../../' );
const util              = require( 'util' );

class Item
{
	constructor( data )
	{
		Object.assign( this, data );
		this.children = [ ];
	}
}

Object.defineProperty( Item.prototype, 'id', {
	get: function( item ) {
		return this.a;
	}
} );

describe( 'general', ( ) =>
{
	it( 'should be able to create new property tree from object tree', ( ) =>
	{
		var root = new Item( { a: 1, b: 2 } );
		root.children.push( new Item( { a: 3, b: 4 } ) );

		var expectedTree = {
			a: 1, b: 2, children: [
				{ a: 3, b: 4, children: [ ] }
			]
		};

		var propTree = propertyTreeMerge( null, root );

		var simpleTree = propertyTreeMerge.extractObjects( propTree );

		expect( simpleTree ).to.deep.equal( expectedTree );
	} );

	it( 'should be able to merge two trees, with root property change', ( ) =>
	{
		var root = new Item( { a: 1, b: 2 } );
		root.children.push( new Item( { a: 3, b: 4 } ) );

		var newRoot = new Item( { a: 5, b: 2 } );
		newRoot.children.push( new Item( { a: 3, b: 4 } ) );

		var expectedTree = {
			a: 5, b: 2, children: [
				{ a: 3, b: 4, children: [ ] }
			]
		};

		var propTree = propertyTreeMerge( null, root );
		propertyTreeMerge( propTree, newRoot );

		var simpleTree = propertyTreeMerge.extractObjects( propTree );

		expect( simpleTree ).to.deep.equal( expectedTree );
	} );

	it( 'should be able to merge two trees, with child property change', ( ) =>
	{
		var root = new Item( { a: 1, b: 2 } );
		root.children.push( new Item( { a: 3, b: 4 } ) );

		var newRoot = new Item( { a: 1, b: 2 } );
		newRoot.children.push( new Item( { a: 3, b: 5 } ) );

		var expectedTree = {
			a: 1, b: 2, children: [
				{ a: 3, b: 5, children: [ ] }
			]
		};

		var propTree = propertyTreeMerge( null, root );
		propertyTreeMerge( propTree, newRoot );

		var simpleTree = propertyTreeMerge.extractObjects( propTree );

		expect( simpleTree ).to.deep.equal( expectedTree );
	} );

	it( 'should be able to merge two trees, with removed child', ( ) =>
	{
		var root = new Item( { a: 1, b: 'x' } );
		root.children.push( new Item( { a: 2, b: 'y' } ) );
		root.children.push( new Item( { a: 3, b: 'z' } ) );

		var newRoot = new Item( { a: 1, b: 'x' } );
		newRoot.children.push( new Item( { a: 3, b: 'z' } ) );

		var expectedTree = {
			a: 1, b: 'x', children: [
				{ a: 3, b: 'z', children: [ ] }
			]
		};

		var propTree = propertyTreeMerge( null, root );
		propertyTreeMerge( propTree, newRoot );

		var simpleTree = propertyTreeMerge.extractObjects( propTree );

		expect( simpleTree ).to.deep.equal( expectedTree );
	} );

	it( 'should be able to merge two trees, with added child', ( ) =>
	{
		var root = new Item( { a: 1, b: 'x' } );
		root.children.push( new Item( { a: 2, b: 'y' } ) );

		var newRoot = new Item( { a: 1, b: 'x' } );
		newRoot.children.push( new Item( { a: 2, b: 'y' } ) );
		newRoot.children.push( new Item( { a: 3, b: 'z' } ) );

		var expectedTree = {
			a: 1, b: 'x', children: [
				{ a: 2, b: 'y', children: [ ] },
				{ a: 3, b: 'z', children: [ ] }
			]
		};

		var propTree = propertyTreeMerge( null, root );
		propertyTreeMerge( propTree, newRoot );

		var simpleTree = propertyTreeMerge.extractObjects( propTree );

		expect( simpleTree ).to.deep.equal( expectedTree );
	} );

/*
	it( 'should be able to get and set values', ( ) =>
	{
		const prop = property( );

		expect( prop( ) ).to.be.a( 'undefined' );

		prop( 1 );
		expect( prop( ) ).to.be.a( 'number' );
		expect( prop( ) ).to.equal( 1 );

		prop( undefined );
		expect( prop( ) ).to.be.a( 'undefined' );

		prop( null );
		expect( prop( ) ).to.be.a( 'null' );
		expect( prop( ) ).to.equal( null );

		const prop2 = property( "hello world" );
		expect( prop2( ) ).to.be.a( 'string' );
		expect( prop2( ) ).to.equal( "hello world" );
	} );

	it( 'should handle valueOf properly', ( ) =>
	{
		const prop = property( 1 );
		expect( 1 + prop ).to.equal( 2 );

		const prop2 = property( "world" );
		expect( "hello " + prop2 ).to.equal( "hello world" );
	} );

	it( 'should handle toString properly', ( ) =>
	{
		const prop = property( "world" );
		expect( `hello ${prop}` ).to.equal( "hello world" );
	} );

	it( 'should be able to listen to changes', ( ) =>
	{
		const prop = property( 1 );

		const newValue = [ prop( ) ];

		prop.emitter.on( 'data', data => newValue.push( data ) );

		prop( 2 );
		prop( "test" );
		prop.emitter.removeAllListeners( );
		prop( 3 );

		expect( newValue ).to.deep.equal( [ 1, 2, "test" ] );
	} );
*/
} );
