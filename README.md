# property-tree-merge

This package contains a way to merge a tree of normal objects, with a tree of `property` objects. The result is a tree of `property` objects. When the new merged tree is created, each changed `property` object will notify to its listener that changes have occured.

The API contains pre-defined default functions for getting a list of children per node, for merging nodes, etc, but they can all be customized.

## API

```js
var propertyTreeMerge = require( 'property-tree-merge' );

dest propertyTreeMerge( dest, src, opts = { } );
```

The `propertyTreeMerge` function takes a property tree as `dest` (which will be in-place modified) and a normal object tree `src`. The `dest` can be `null`, in which case a new property tree is returned.

The `opts` is an optional object defining options to the merge:

```js
sorter:     ( a, b ) => a - b    // Comparison function for sort()
identifyer: obj => obj.id        // Function which returns a unique ID for the
                                 // node (must be unique per shared parent-
                                 // node, not necessary in the entire tree)
changed:    ( a, b ) => ...      // Function which checks if a and b have
                                 // diverged and therefore needs to be merged
childRefs:  obj => obj.children  // Function returning the children array per
                                 // node
merge:      ( dest, src ) => ... // Merge node src into dest, but not the
                                 // children. property-tree-merge handles the
                                 // children
```

## Usage

### Create a new property tree from a normal object tree:

```js
var newPropertyTree = propertyTreeMerge( null, tree );
```

### Merge trees

```js
/*var propertyTree = */ propertyTreeMerge( propertyTree, tree );
// The return value is the same as propertyTree, since merging is in-place.
```
