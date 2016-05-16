'use strict';

var property = require( 'property' );

module.exports = treeMerge;

function keysWithoutChildren( obj )
{
	var keys = Object.keys( obj );
	var childrenIndex = keys.indexOf( "children" );
	if ( childrenIndex !== -1 )
		keys.splice( childrenIndex, 1 );
	return keys;
}

function defaultSorter( a, b )
{
	return a - b;
}
function defaultIdentifyer( obj )
{
	return obj.id;
}
function defaultChanged( a, b )
{
	var keysA = keysWithoutChildren( a );
	var keysB = keysWithoutChildren( b );

	if ( keysA.length !== keysB.length )
		return true;

	keysA.sort( );
	keysB.sort( );
	if ( keysA.join( ) != keysB )
		return true;

	for ( var i = 0; i < keysA.length; ++i )
	{
		var key = keysA[ i ];
		if ( a[ key ] != b[ key ] )
			return true;
	}

	return false;
}
function defaultChildRefs( obj )
{
	return obj.children;
}
function defaultMerger( dest, src )
{
	var keys = keysWithoutChildren( src );
	keys.forEach( function( key )
	{
		dest[ key ] = src[ key ];
	} );
}

/**
 * Merges sourceTree into propertyTree, so that we can re-use propertyTree
 *
 * This works semantically the same way as mergeTree() although each
 * node in the `propertyTree` is a property proxy object wrapping the real
 * data. When a sub-tree changes, the root of the sub-tree will emit
 * change events.
 *
 * @param  property propertyTree The destination tree, a property-tree
 * @param  Object   sourceTree   The source tree, a normal object tree
 * @param  Object   [opts]       Options object, specifying settings
 * @return propertyTree
 */
function treeMerge( propertyTree, sourceTree, opts )
{
	opts = opts || { };
	var sorter     = opts.sorter     || defaultSorter;
	var identifyer = opts.identifyer || defaultIdentifyer;
	var changed    = opts.changed    || defaultChanged;
	var childRefs  = opts.childRefs  || defaultChildRefs;
	var merge      = opts.merge      || defaultMerger;

	function sortCmp( a, b )
	{
		return sorter( a( ), b( ) );
	};

	var force = !propertyTree;

	if ( !propertyTree )
		propertyTree = property( sourceTree );

	var notifications = [ ];

	function recurse( oldNode, newNode, force )
	{
		var oldChildren    = force ? [ ] : childRefs( oldNode( ) );
		var newChildrenMap = { };
		var nodeChanged = false;
		var shouldNotify = false;
		var i, n, keys;

		childRefs( newNode ).forEach( function( newChild ) {
			newChildrenMap[ identifyer( newChild ) ] = newChild;
		} );

		// Method:
		// 1 Go through old children:
		//   2 If not found in new children list, remove it (splice)
		//   3 If found, merge and recurse
		// 4 Append the new children we didn't have before (if any)
		// 5 (Re-)sort the children list, if it was modified

		// 1, 2, 3
		for ( i = 0, n = oldChildren.length; i < n; ++i )
		{
			var oldChild = oldChildren[ i ];
			var newChild = newChildrenMap[ identifyer( oldChild( ) ) ];
			if ( 'undefined' === typeof newChild )
			{
				// 2. We modify the list we iterate over in-place, so
				//    we need to update the loop counters accordingly.
				oldChildren.splice( i, 1 );
				--i, --n;
				shouldNotify = true;
			}
			else
			{
				// 3. We consider a list change if the name has
				//    changed, since this will affect the sort order.
				var difference = changed( oldChild( ), newChild );
				nodeChanged = nodeChanged || !!difference;

				if ( difference )
					merge( oldChild( ), newChild );
				recurse( oldChild, newChild );

				delete newChildrenMap[ identifyer( oldChild( ) ) ];
			}
		}

		// 4
		keys = Object.keys( newChildrenMap );
		if ( keys.length > 0 )
		{
			nodeChanged = true;
			var addedNewChildren = keys.map( function( key ) {
				return treeMerge( null, newChildrenMap[ key ], opts );
			} );
			oldChildren.push.apply( oldChildren, addedNewChildren );
		}

		// 5
		if ( nodeChanged )
			oldChildren.sort( sortCmp );

		if ( force )
		{
			// Overwrite the old children array with the property-wrapped one
			var arr = childRefs( oldNode( ) );
			arr.length = 0;
			arr.push.apply( arr, oldChildren );
		}

		// If we're at the root, check if the root objects differ
		if ( newNode === sourceTree )
		{
			var rootDifference = changed( oldNode( ), newNode );
			shouldNotify = shouldNotify || !!rootDifference;
		}

		if ( shouldNotify || nodeChanged )
			notifications.push( oldNode );
	}

	recurse( propertyTree, sourceTree, force );

	if ( changed( propertyTree( ), sourceTree ) )
		merge( propertyTree( ), sourceTree );

	// Trigger all change notifications
	notifications.forEach( function( prop ) {
		prop.notify( );
	} );

	return propertyTree;
}

/**
 * Converts a property tree to a normal object tree.
 *
 * Needs the same opts as treeMerge, but only with childRefs.
 *
 * @return New simplified object tree.
 */
function extractObjects( obj, opts )
{
	var root = Object.assign( { }, obj( ) );

	opts = opts || { };
	var childRefs  = opts.childRefs || defaultChildRefs;

	root.children = childRefs( obj( ) ).map( function( child )
	{
		return extractObjects( child );
	} );
	return root;
}

treeMerge.extractObjects = extractObjects;
