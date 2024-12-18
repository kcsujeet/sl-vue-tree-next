# sl-vue-tree-next

Vue3 supported version of sl-vue-tree. A customizable draggable tree component for Vue.js.

![preview](preview.png)

[demo](https://kcsujeet.github.io/sl-vue-tree-next/demo/index.html)

install

`npm i sl-vue-tree-next`


# Quick start
````html

<template>
    <h2>Vue 3 Tree</h2>
    <sl-vue-tree-next v-model="nodes" />

</template>

<script setup lang="ts">
import { SlVueTreeNext } from 'sl-vue-tree-next'

const nodes = [
    { title: 'Item1', isLeaf: true },
    { title: 'Item2', isLeaf: true, data: { visible: false } },
    { title: 'Folder1' },
    {
        title: 'Folder2',
        isExpanded: true,
        children: [
            { title: 'Item3', isLeaf: true },
            { title: 'Item4', isLeaf: true },
            {
                title: 'Folder3',
                children: [{ title: 'Item5', isLeaf: true }],
            },
        ],
    },
    { title: 'Folder5', isExpanded: false },
    { title: 'Item6', isLeaf: true },
    { title: 'Item7', isLeaf: true, data: { visible: false } },
    {
        title: 'Folder6',
        children: [
            {
                title: 'Folder7',
                children: [
                    { title: 'Item8', isLeaf: true },
                    { title: 'Item9', isLeaf: true },
                ],
            },
        ],
    },
]
</script>

<style>
  @import 'sl-vue-tree-next/sl-vue-tree-next-minimal.css';
</style>
````
You can also use dark version.
```html
<style>
  @import 'sl-vue-tree-next/sl-vue-tree-next-dark.css';
</style>
```

The `value` property is an array of `NodeModel` nodes:

````typescript
interface NodeModel<TDataType> {
    title: string;
    isLeaf?: boolean;
    children?: NodeModel<TDataType>[];
    isExpanded?: boolean;
    isSelected?: boolean;
    isDraggable?: boolean;
    isSelectable?: boolean;
    data?: TDataType; // any serializable user data
}
````

For convenience the component's events return `Node` objects. Those actually are `NodeModel`
with some computed props:
````typescript
interface TreeNode<TDataType> extends NodeModel<TDataType> {
    isFirstChild: boolean;
    isLastChild: boolean;
    isVisible: boolean;	// node is visible if all of its parents are expanded
    level: number; // nesting level
    ind: number; // index in the array of siblings
    path: number[]; // path to node as array of indexes, for example [2, 0, 1] in the example above is path to `Item4`
    pathStr: string; // serialized path to node
    children: TreeNode<TDataType>[];
}
````

You can get the list of `Node` from the computed `slVueTree.currentNodes` property



# Props

| prop             | type               | default                | description                                                                                                                                                                                              |
|------------------|--------------------|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| value            | NodeModel[] | []                     | An array of nodes to show. Each node is represented by `NodeModel` interface                                                                                                                              |
| allowMultiselect | Boolean            | true                   | Disable or enable the multiselect feature                                                                                                                                                                |
| allowToggleBranch | Boolean            | true                   | Disable or enable the expand/collapse button                                                                                                                                                                |
| edgeSize         | Number             | 3                      | Offset in pixels from top and bottom for folder-node element. While dragging cursor is in that offset, the dragging node will be placed before or after the folder-node instead of being placed inside the folder. |
| scrollAreaHeight | Number             | 70                     | Offset in pixels from top and bottom for the component element. While dragging cursor is in that area, the scrolling starts.                                                                                |
| maxScrollSpeed   | Number             | 20                     | The scroll speed is relative to the cursor position. Defines the max scroll speed.
| multiselectKey   | String/String[] |['ctrlKey', 'metaKey'] | The keys for multiselect mode. Allowed values are ['ctrlKey', 'metaKey', 'altKey']

# Computed props

| prop           | type            | description                                                                                                                                                                                                                                                     |
|----------------|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| currentNodes          | TreeNode[]   | List of nodes with some computed props. See `Node` interface.                                                                                                                                                                                            |
| cursorPosition | ICursorPosition | Represents the current cursor position that describes the action that will be applied to the dragged node on `mouseup` event. See `ICursorPosition` interface |
| selectionSize  | Number          | The count of selected nodes
| dragSize       | Number          | The count of selected and draggable nodes
| isDragging     | Boolean         | True if nodes are dragging

````
interface ICursorPosition<TDataType> {
  node: Node<TDataType>;
  placement: 'before' | 'inside' | 'after';
}
````

# Events

| event           | callback arguments                                                         | description                                       |
|-----------------|----------------------------------------------------------------------------|---------------------------------------------------|
| input           | nodes: NodeModel[]                                                  | triggers for any changes to `value` property     |
| select          | selectedNodes: TreeNode[], event: MouseEvent                            | triggers when a node has been selected/deselected |
| toggle          | toggledNode: TreeNode, event: MouseEvent                                | triggers when a node has been collapsed/expanded  |
| drop            | draggingNodes: TreeNode[], position: ICursorPosition, event: MouseEvent | triggers when dragging nodes have been dropped    |
| nodeclick       | node: TreeNode, event: MouseEvent                                       | handle `click` event on node                      |
| nodedblclick    | node: TreeNode, event: MouseEvent                                       | handle `dblclick` event on node                   |
| nodecontextmenu | node: TreeNode, event: MouseEvent                                       | handle `contextmenu` event on node                |
| externaldrop    | cursorPosition: ICursorPosition, event: MouseEvent                         | handle `drop` event for external items [demo](https://kcsujeet.github.io/sl-vue-tree-next/demo/externaldrag.html)             |

# Methods


| method                                                                                                   | description                                                                                        |
|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| getNode(path: number[]): TreeNode                                                                     | Find the node by using its path                                                                   |
| traverse(cb: (node: TreeNode, nodeModel: NodeModel, siblings: NodeModel[])  => boolean) | Helpful method to traverse all nodes. The traversing will be stopped if callback returns `false`.  |
| updateNode({ path: number[], patch: Partial<NodeModel> })                                             | Update the node by using its path                                                                 |
| select(path: number[], addToSelection = false)                                                           | Select the node by using its path                                                                 |                                                                                                                                              |
| getNodeEl(): HTMLElement                                                                                 | Get the node HTMLElement by using its path                                                        |
| getSelected(): TreeNode[]                                                                             | Get selected nodes                                                                                 |
| insert(position: ICursorPosition, nodeModel: NodeModel)                                           | Insert nodes by the current cursor position.                                                       |
| remove(paths: number[][])                                                                                | Remove nodes by paths. For example `.remove([[0,1], [0,2]])`
| getFirstNode(): TreeNode                                                                              | Get the first node in the tree                                                                     |
| getLastNode(): TreeNode                                                                               | Get the last node in the tree
| getNextNode(path: number[], filter?: (node: TreeNode<TDataType>) => boolean): TreeNode<TDataType>; | Get the next node. You can skip the next nodes by using `filter`
| getPrevNode(path: number[], filter?: (node: TreeNode<TDataType>) => boolean): TreeNode<TDataType>; | Get the previous node. You can skip the previous nodes by using `filter`

# Slots


| slot       | context     | description                                                                                   |
|------------|-------------|-----------------------------------------------------------------------------------------------|
| title      | TreeNode | Slot for item title                                                                           |
| toggle     | TreeNode | Slot for expand/collapse button                                                               |
| sidebar    | TreeNode | Sidebar content                                                                               |
| draginfo   | SlVueTree   | Slot that follows the mouse cursor while dragging. By default shows the dragging nodes count. |
| empty-node | TreeNode | Slot for (optional) message when folder is open, but empty                                    |


# Examples


## Add a folder or item icon via `title` slot
````html
<sl-vue-tree-next v-model="nodes">
    <template #title="{ node }">

      <span class="item-icon">
        <i class="fa fa-file" v-if="node.isLeaf"></i>
        <i class="fa fa-folder" v-if="!node.isLeaf"></i>
      </span>

      {{ node.title }}

    </template>
</sl-vue-tree-next>

````

## Select all nodes

```javascript
slVueTree.traverse((node, nodeModel, path) => {
    Vue.set(nodeModel, 'isSelected', true);
})
```

## Handle keydown and keyup events via `getNextNode` and `getPrevNode` methods

## Contributing
[see CONTRIBUTING.md](CONTRIBUTING.md)

# Changelog
v0.0.13
- fixes duplicate node issue when moving multiple nodes
- uses deep merge to update node when using updateNode function
- fixes dark mode toggle button in demo

v0.0.12
- fixes wrong `defineComponent` not defined issue

v0.0.11
- fixes keyboard control issues
- exposes maxScrollSpeed and scrollAreaHeight as props
- exposes selectionSize to ref

v0.0.10
- fixes lower level icons not appearing bug
- fixes node update bug

v0.0.9
- update demo
- update readme

v0.0.8
- update demos

v0.0.7
  - add support for generics

v0.0.6
  - update readme.md

v0.0.5
  - fix computed warnings in console
  - fixed duplicate nodes bug

v0.0.4
  - made minimal and dark css available

v0.0.3
  - removed vue from dependency and added to peer dependency

v0.0.2
  - added type safety to props and methods

v0.0.1
  - migrated to vue 3
