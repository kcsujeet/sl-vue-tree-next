<template>
    <div
        ref="rootRef"
        class="sl-vue-tree-next"
        :class="{ 'sl-vue-tree-next-root': isRoot }"
        @mousemove="onMousemoveHandler"
        @touchmove="onMousemoveHandler"
        @mouseleave="onMouseleaveHandler"
        @touchcancel="onMouseleaveHandler"
    >
        <div ref="nodes" class="sl-vue-tree-next-nodes-list">
            <div
                class="sl-vue-tree-next-node"
                v-for="(node, nodeInd) in currentNodes"
                :class="{ 'sl-vue-tree-next-selected': node.isSelected }"
            >
                <div
                    class="sl-vue-tree-next-cursor sl-vue-tree-next-cursor_before"
                    @dragover.prevent
                    :style="{
                        visibility:
                            cursorPosition &&
                            cursorPosition.node.pathStr === node.pathStr &&
                            cursorPosition.placement === 'before'
                                ? 'visible'
                                : 'hidden',
                        '--depth': depth,
                    }"
                >
                    <!-- suggested place for node insertion  -->
                </div>

                <div
                    class="sl-vue-tree-next-node-item"
                    @mousedown="onNodeMousedownHandler($event, node)"
                    @touchstart="onNodeMousedownHandler($event, node)"
                    @mouseup="onNodeMouseupHandler($event, node)"
                    @touchend="onNodeMouseupHandler($event, node)"
                    @contextmenu="emitNodeContextmenu(node, $event)"
                    @dblclick="emitNodeDblclick(node, $event)"
                    @click="emitNodeClick(node, $event)"
                    @dragover="onExternalDragoverHandler(node, $event)"
                    @drop="onExternalDropHandler(node, $event)"
                    :path="node.pathStr"
                    :class="{
                        'sl-vue-tree-next-cursor-hover': cursorPosition && cursorPosition.node.pathStr === node.pathStr,

                        'sl-vue-tree-next-cursor-inside':
                            cursorPosition &&
                            cursorPosition.placement === 'inside' &&
                            cursorPosition.node.pathStr === node.pathStr,
                        'sl-vue-tree-next-node-is-leaf': node.isLeaf,
                        'sl-vue-tree-next-node-is-folder': !node.isLeaf,
                    }"
                >
                    <div class="sl-vue-tree-next-gap" v-for="gapInd in gaps"></div>

                    <div class="sl-vue-tree-next-branch" v-if="level && showBranches">
                        <slot name="branch" :node="node">
                            <span v-if="!node.isLastChild">
                                {{ String.fromCharCode(0x251c) }}{{ String.fromCharCode(0x2500) }}&nbsp;
                            </span>
                            <span v-if="node.isLastChild">
                                {{ String.fromCharCode(0x2514) }}{{ String.fromCharCode(0x2500) }}&nbsp;
                            </span>
                        </slot>
                    </div>

                    <div class="sl-vue-tree-next-title">
                        <span
                            class="sl-vue-tree-next-toggle"
                            v-if="!node.isLeaf"
                            @click="onToggleHandler($event, node)"
                        >
                            <slot name="toggle" :node="node">
                                <span>
                                    {{ !node.isLeaf ? (node.isExpanded ? '-' : '+') : '' }}
                                </span>
                            </slot>
                        </span>

                        <slot name="title" :node="node">{{ node.title }}</slot>

                        <slot
                            name="empty-node"
                            :node="node"
                            v-if="!node.isLeaf && node.children.length == 0 && node.isExpanded"
                        >
                        </slot>
                    </div>

                    <div class="sl-vue-tree-next-sidebar">
                        <slot name="sidebar" :node="node"></slot>
                    </div>
                </div>

                <SlVueTreeNext
                    v-if="node.children && node.children.length && node.isExpanded"
                    :model-value="node.children"
                    :level="node.level"
                    :parent-ind="nodeInd"
                    :allow-multiselect="allowMultiselect"
                    :allow-toggle-branch="allowToggleBranch"
                    :edge-size="edgeSize"
                    :show-branches="showBranches"
                    :parent-context="currentContext"
                    :root-context="isRoot ? currentContext : rootContext"
                    @update-node="updateNode"
                    @dragover.prevent
                >
                    <template #title="{ node }">
                        <slot name="title" :node="node">{{ node.title }}</slot>
                    </template>

                    <template #toggle="{ node }">
                        <slot name="toggle" :node="node">
                            <span>
                                {{ !node.isLeaf ? (node.isExpanded ? '-' : '+') : '' }}
                            </span>
                        </slot>
                    </template>

                    <template #sidebar="{ node }">
                        <slot name="sidebar" :node="node"></slot>
                    </template>

                    <template #empty-node="{ node }">
                        <slot
                            name="empty-node"
                            :node="node"
                            v-if="!node.isLeaf && node.children.length == 0 && node.isExpanded"
                        >
                        </slot>
                    </template>
                </SlVueTreeNext>

                <div
                    class="sl-vue-tree-next-cursor sl-vue-tree-next-cursor_after"
                    @dragover.prevent
                    :style="{
                        visibility:
                            cursorPosition &&
                            cursorPosition.node.pathStr === node.pathStr &&
                            cursorPosition.placement === 'after'
                                ? 'visible'
                                : 'hidden',
                        '--depth': depth,
                    }"
                >
                    <!-- suggested place for node insertion  -->
                </div>
            </div>

            <div v-show="isDragging" v-if="isRoot" ref="dragInfoRef" class="sl-vue-tree-next-drag-info">
                <slot name="draginfo"> Items: {{ selectionSize }} </slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" generic="T">
import { ref, onMounted, onBeforeUnmount, watchEffect, computed, Ref } from 'vue'
import {
    type NodeModel,
    type TreeNode,
    type SlVueTreeProps,
    type CursorPosition,
    type Context,
    MultiSelectKey,
} from './types'
import { deepMerge } from './utils'

// props
const props = withDefaults(defineProps<SlVueTreeProps<T>>(), {
    modelValue: () => [],
    edgeSize: 3,
    showBranches: false,
    level: 0,
    parentInd: undefined,
    allowMultiselect: true,
    allowToggleBranch: true,
    multiselectKey: () => [MultiSelectKey.CTRL, MultiSelectKey.META],
    scrollAreaHeight: 70,
    maxScrollSpeed: 20,
})

// emits
const emit = defineEmits([
    'update:modelValue',
    'select',
    'beforedrop',
    'drop',
    'toggle',
    'nodeclick',
    'nodedblclick',
    'updateNode',
    'nodecontextmenu',
    'externaldragover',
    'externaldrop',
])

// component refs
const dragInfoRef = ref<HTMLDivElement>()
const rootRef = ref<HTMLDivElement>()

// data
const rootCursorPosition = ref<CursorPosition<T>>(null) as Ref<CursorPosition<T> | null>
const scrollIntervalId = ref(0)
const scrollSpeed = ref(0)
const lastSelectedNode = ref<TreeNode<T> | null>(null) as Ref<TreeNode<T> | null>
const mouseIsDown = ref(false)
const isDragging = ref(false)
const lastMousePos = ref({ x: 0, y: 0 })
const preventDrag = ref(false)
const currentValue = ref<NodeModel<T>[]>([]) as Ref<NodeModel<T>[]>

// computed
const isRoot = computed(() => !props.level)
/**
 * gaps is using for nodes indentation
 * @returns {number[]}
 */
const gaps = computed(() => {
    const temp: number[] = []
    let i = props.level - 1
    if (!props.showBranches) i++
    while (i-- > 0) temp.push(i)
    return temp
})

const cursorPosition = computed<CursorPosition<T>>(() => {
    const currentPos = isRoot.value ? rootCursorPosition.value : getParent()?.cursorPosition.value
    return currentPos as CursorPosition<T>
})

const depth = computed(() => {
    return gaps.value.length
})

const currentNodes = computed<TreeNode<T>[]>(() => {
    if (isRoot.value) {
        const nodeModels = copy(currentValue.value)
        const n = getNodes(nodeModels)
        return n
    }

    if (props.parentInd === null) return []

    const n = getParent()?.currentNodes?.value?.[props.parentInd]?.children
    return n
})

const selectionSize = computed(() => {
    return getSelected().length
})

const dragSize = computed(() => {
    return getDraggable().length
})

// mounted
onMounted(() => {
    if (isRoot.value) {
        document.addEventListener('mouseup', onDocumentMouseupHandler)
    }
})

// before unmount
onBeforeUnmount(() => {
    document.removeEventListener('mouseup', onDocumentMouseupHandler)
})

// watch
watchEffect(() => {
    currentValue.value = props.modelValue
})

// methods
const setCursorPosition = (pos) => {
    if (isRoot.value) {
        rootCursorPosition.value = pos
        return
    }
    getParent()?.setCursorPosition(pos)
}

const getNodes = (nodeModels, parentPath = [], visible = true) => {
    return nodeModels.map((nodeModel, ind) => {
        const nodePath = parentPath.concat(ind)
        return getNode(nodePath, nodeModel, nodeModels, visible)
    })
}

const getNode = (
    path,
    nodeModel: NodeModel<T> | null = null,
    siblings: NodeModel<T>[] | null = null,
    visible = null,
): TreeNode<T> | null => {
    const ind = path.slice(-1)[0]

    // calculate nodeModel, siblings, visible fields if it is not passed as arguments
    siblings = siblings || getNodeSiblings(currentValue.value, path)
    nodeModel = nodeModel || (siblings && siblings[ind]) || null

    if (visible == null) {
        visible = isVisible?.(path)
    }

    if (!nodeModel) return null

    const isExpanded = nodeModel.isExpanded == void 0 ? true : !!nodeModel.isExpanded
    const isDraggable = nodeModel.isDraggable == void 0 ? true : !!nodeModel.isDraggable
    const isSelectable = nodeModel.isSelectable == void 0 ? true : !!nodeModel.isSelectable

    const node: TreeNode<T> = {
        // define the all TreeNodeModel props
        title: nodeModel.title,
        isLeaf: !!nodeModel.isLeaf,
        children: nodeModel.children ? getNodes(nodeModel.children, path, isExpanded) : [],
        isSelected: !!nodeModel.isSelected,
        isExpanded,
        isVisible: visible,
        isDraggable,
        isSelectable,
        data: nodeModel.data !== void 0 ? nodeModel.data : ({} as T),

        // define the all TreeNode computed props
        path: path,
        pathStr: JSON.stringify(path),
        level: path.length,
        ind,
        isFirstChild: ind == 0,
        isLastChild: ind == (siblings?.length ?? 0) - 1,
    }

    return node
}

const isVisible = (path) => {
    if (path.length < 2) return true
    let nodeModels = currentValue.value as NodeModel<T>[]

    for (let i = 0; i < path.length - 1; i++) {
        let ind = path[i]
        let nodeModel = nodeModels[ind]
        let isExpanded = nodeModel.isExpanded == void 0 ? true : !!nodeModel.isExpanded
        if (!isExpanded) return false
        nodeModels = nodeModel.children || []
    }

    return true
}

const emitInput = (newValue) => {
    currentValue.value = newValue
    getRoot().emit('update:modelValue', newValue)
}

const emitSelect = (selectedNodes, event) => {
    getRoot().emit('select', selectedNodes, event)
}

const emitBeforeDrop = (draggingNodes, position, cancel) => {
    getRoot().emit('beforedrop', draggingNodes, position, cancel)
}

const emitDrop = (draggingNodes, position, event) => {
    getRoot().emit('drop', draggingNodes, position, event)
}

const emitToggle = (toggledNode, event) => {
    getRoot().emit('toggle', toggledNode, event)
}

const emitNodeClick = (node, event) => {
    getRoot().emit('nodeclick', node, event)
}

const emitNodeDblclick = (node, event) => {
    getRoot().emit('nodedblclick', node, event)
}

const emitNodeContextmenu = (node, event) => {
    getRoot().emit('nodecontextmenu', node, event)
}

const onExternalDragoverHandler = (node, event) => {
    event.preventDefault()
    const root = getRoot()
    const cursorPosition = root.getCursorPositionFromCoords(event.clientX, event.clientY)
    root.setCursorPosition(cursorPosition)
    root.emit('externaldragover', cursorPosition, event)
}

const onExternalDropHandler = (node, event) => {
    const root = getRoot()
    const cursorPosition = root.getCursorPositionFromCoords(event.clientX, event.clientY)
    root.emit('externaldrop', cursorPosition, event)
    setCursorPosition(null)
}

const onDragEndHandler = (node, event) => {
    console.log('onDragEndHandler', node, event)
}

const select = (path, addToSelection = false, event: MouseEvent | TouchEvent | null = null) => {
    const multiselectKeys = Array.isArray(props.multiselectKey) ? props.multiselectKey : [props.multiselectKey]
    const multiselectKeyIsPressed = event && !!multiselectKeys.find((key) => event[key])
    addToSelection = (multiselectKeyIsPressed || addToSelection) && props.allowMultiselect

    const selectedNode = getNode(path)
    if (!selectedNode) return null
    const newNodes = copy(currentValue.value)
    const shiftSelectionMode = props.allowMultiselect && event && event.shiftKey && lastSelectedNode.value
    const selectedNodes: NodeModel<T>[] = []
    let shiftSelectionStarted = false

    traverse((node, nodeModel) => {
        if (shiftSelectionMode) {
            if (node.pathStr === selectedNode.pathStr || node.pathStr === lastSelectedNode.value?.pathStr) {
                nodeModel.isSelected = node.isSelectable
                shiftSelectionStarted = !shiftSelectionStarted
            }
            if (shiftSelectionStarted) nodeModel.isSelected = node.isSelectable
        } else if (node.pathStr === selectedNode.pathStr) {
            nodeModel.isSelected = node.isSelectable
        } else if (!addToSelection) {
            if (nodeModel.isSelected) nodeModel.isSelected = false
        }

        if (nodeModel.isSelected) selectedNodes.push(node)
    }, newNodes)

    lastSelectedNode.value = selectedNode
    emitInput(newNodes)
    emitSelect(selectedNodes, event)
    return selectedNode
}

const onMousemoveHandler = (event) => {
    if (!isRoot.value) {
        getRoot()?.onMousemoveHandler(event)
        return
    }

    if (preventDrag.value) return

    if (event.type === 'touchmove') {
        event.preventDefault()
        event.clientX = event.touches[0].clientX
        event.clientY = event.touches[0].clientY
    }

    const initialDraggingState = isDragging.value
    const dragging =
        initialDraggingState ||
        (mouseIsDown.value && (lastMousePos.value.x !== event.clientX || lastMousePos.value.y !== event.clientY))
    const isDragStarted = initialDraggingState === false && dragging === true

    lastMousePos.value = {
        x: event.clientX,
        y: event.clientY,
    }

    if (!dragging) return

    const $root = getRoot().ref.value as HTMLDivElement
    const rootRect = $root.getBoundingClientRect()
    const dragInfoTop =
        event.clientY - rootRect.top + $root.scrollTop - Number(dragInfoRef.value?.style.marginBottom ?? 0)
    const dragInfoLeft = event.clientX - rootRect.left

    if (dragInfoRef.value) {
        dragInfoRef.value.style.top = dragInfoTop + 'px'
        dragInfoRef.value.style.left = dragInfoLeft + 'px'
    }

    const cursorPosition = getCursorPositionFromCoords(event.clientX, event.clientY)
    const destNode = cursorPosition?.node
    const placement = cursorPosition?.placement

    if (isDragStarted && !destNode.isSelected) {
        select(destNode.path, false, event)
    }

    const draggableNodes = getDraggable()
    if (!draggableNodes.length) {
        preventDrag.value = true
        return
    }

    isDragging.value = dragging

    setCursorPosition({ node: destNode, placement })

    const scrollBottomLine = rootRect.bottom - props.scrollAreaHeight
    const scrollDownSpeed = (event.clientY - scrollBottomLine) / (rootRect.bottom - scrollBottomLine)
    const scrollTopLine = rootRect.top + props.scrollAreaHeight
    const scrollTopSpeed = (scrollTopLine - event.clientY) / (scrollTopLine - rootRect.top)

    if (scrollDownSpeed > 0) {
        startScroll(scrollDownSpeed)
    } else if (scrollTopSpeed > 0) {
        startScroll(-scrollTopSpeed)
    } else {
        stopScroll()
    }
}

const getCursorPositionFromCoords = (x, y) => {
    const $target = document.elementFromPoint(x, y)
    const $nodeItem = $target?.getAttribute('path') ? $target : getClosetElementWithPath($target)
    let destNode
    let placement

    if ($nodeItem) {
        if (!$nodeItem) return

        destNode = getNode(JSON.parse($nodeItem.getAttribute('path')))

        const nodeHeight = $nodeItem.offsetHeight
        const edgeSize = props.edgeSize
        const offsetY = y - $nodeItem.getBoundingClientRect().top

        if (destNode.isLeaf) {
            placement = offsetY >= nodeHeight / 2 ? 'after' : 'before'
        } else {
            if (offsetY <= edgeSize) {
                placement = 'before'
            } else if (offsetY >= nodeHeight - edgeSize) {
                placement = 'after'
            } else {
                placement = 'inside'
            }
        }
    } else {
        const $root = getRoot().ref.value
        const rootRect = $root.getBoundingClientRect()
        if (y > rootRect.top + rootRect.height / 2) {
            placement = 'after'
            destNode = getLastNode()
        } else {
            placement = 'before'
            destNode = getFirstNode()
        }
    }

    return { node: destNode, placement }
}

const getClosetElementWithPath = ($el) => {
    if (!$el) return null
    if ($el.getAttribute('path')) return $el
    return getClosetElementWithPath($el.parentElement)
}

const onMouseleaveHandler = (event) => {
    if (!isRoot.value || !isDragging.value) return
    const $root = getRoot().ref.value
    const rootRect = $root.getBoundingClientRect()

    if (event.type === 'touchcancel') {
        event.clientX = lastMousePos.value.x
        event.clientY = lastMousePos.value.y
    }

    if (event.clientY >= rootRect.bottom) {
        const nodesCopy = structuredClone(currentNodes.value)
        setCursorPosition({ node: nodesCopy[0], placement: 'after' })
    } else if (event.clientY < rootRect.top) {
        setCursorPosition({ node: getFirstNode(), placement: 'before' })
    }
}

const getNodeEl = (path: number[]): HTMLElement => {
    return getRoot().ref.value.querySelector(`[path="${JSON.stringify(path)}"]`)
}

const getLastNode = () => {
    let lastNode = null
    traverse((node) => {
        lastNode = node
    })
    return lastNode
}

const getFirstNode = () => {
    return getNode([0])
}

const getNextNode = (path: number[], filter?: (node: TreeNode<T>) => boolean): TreeNode<T> => {
    let resultNode = null

    traverse((node) => {
        if (comparePaths(node.path, path) < 1) return

        if (!filter || filter(node)) {
            resultNode = node
            return false // stop traverse
        }
    })

    return resultNode
}

const getPrevNode = (path: number[], filter?: (node: TreeNode<T>) => boolean) => {
    let prevNodes: TreeNode<T>[] = []

    traverse((node) => {
        if (comparePaths(node.path, path) >= 0) {
            return false
        }
        prevNodes.push(node)
    })

    let i = prevNodes.length
    while (i--) {
        const node = prevNodes[i]
        if (!filter || filter(node)) return node
    }

    return null
}

/**
 * returns 1 if path1 > path2
 * returns -1 if path1 < path2
 * returns 0 if path1 == path2
 *
 * examples
 *
 * [1, 2, 3] < [1, 2, 4]
 * [1, 1, 3] < [1, 2, 3]
 * [1, 2, 3] > [1, 2, 0]
 * [1, 2, 3] > [1, 1, 3]
 * [1, 2] < [1, 2, 0]
 *
 */

const comparePaths = (path1, path2) => {
    for (let i = 0; i < path1.length; i++) {
        if (path2[i] == void 0) return 1
        if (path1[i] > path2[i]) return 1
        if (path1[i] < path2[i]) return -1
    }
    return path2[path1.length] == void 0 ? 0 : -1
}

const onNodeMousedownHandler = (event, node) => {
    // handle only left mouse button
    if (event.type == 'mousedown' && event.button !== 0) return

    if (!isRoot.value) {
        getRoot().onNodeMousedownHandler(event, node)
        return
    }
    mouseIsDown.value = true
}

const startScroll = (speed) => {
    const $root = getRoot().ref.value
    if (scrollSpeed.value === speed) {
        return
    } else if (scrollIntervalId.value) {
        stopScroll()
    }

    scrollSpeed.value = speed
    scrollIntervalId.value = setInterval(() => {
        $root.scrollTop += props.maxScrollSpeed * speed
    }, 20)
}

const stopScroll = () => {
    clearInterval(scrollIntervalId.value)
    scrollIntervalId.value = 0
    scrollSpeed.value = 0
}

const onDocumentMouseupHandler = (event) => {
    if (isDragging.value) onNodeMouseupHandler(event)
}

const onNodeMouseupHandler = (event, targetNode: TreeNode<T> | null = null) => {
    // handle only left mouse button
    if (event.type == 'mouseup' && event.button !== 0) return

    if (!isRoot.value) {
        getRoot().onNodeMouseupHandler(event, targetNode)
        return
    }

    mouseIsDown.value = false

    if (!isDragging.value && targetNode && !preventDrag.value) {
        select(targetNode.path, false, event)
    }

    preventDrag.value = false

    if (!cursorPosition.value) {
        stopDrag()
        return
    }

    const draggingNodes = getDraggable()

    // check that nodes is possible to insert
    for (let draggingNode of draggingNodes) {
        if (draggingNode.pathStr == cursorPosition.value.node.pathStr) {
            stopDrag()
            return
        }

        if (checkNodeIsParent(draggingNode, cursorPosition.value.node)) {
            stopDrag()
            return
        }
    }

    const newNodes = copy(currentValue.value)
    const nodeModelsSubjectToInsert: TreeNode<T>[] = []

    // find dragging model to delete
    for (let draggingNode of draggingNodes) {
        const sourceSiblings = getNodeSiblings(newNodes, draggingNode.path)
        const draggingNodeModel = sourceSiblings[draggingNode.ind]
        nodeModelsSubjectToInsert.push(draggingNodeModel)
    }

    // allow the drop to be cancelled
    let cancelled = false
    emitBeforeDrop(draggingNodes, cursorPosition.value, () => (cancelled = true))

    if (cancelled) {
        stopDrag()
        return
    }

    const nodeModelsToInsert: TreeNode<T>[] = []

    // mark dragging model to delete
    for (let draggingNodeModel of nodeModelsSubjectToInsert) {
        nodeModelsToInsert.push(copy(draggingNodeModel))
        draggingNodeModel['toBeDeleted'] = true
    }

    // insert dragging nodes to the new place
    insertModels(cursorPosition.value, nodeModelsToInsert, newNodes)

    // delete dragging node from the old place
    traverseModels((nodeModel, siblings, ind) => {
        if (!nodeModel.toBeDeleted) return
        siblings.splice(ind, 1)
    }, newNodes)

    lastSelectedNode.value = null
    emitInput(newNodes)
    emitDrop(draggingNodes, cursorPosition.value, event)
    stopDrag()
}

const onToggleHandler = (event, node) => {
    if (!props.allowToggleBranch) return

    updateNode({ path: node.path, patch: { isExpanded: !node.isExpanded } })
    emitToggle(node, event)
    event.stopPropagation()
}

const stopDrag = () => {
    isDragging.value = false
    mouseIsDown.value = false
    setCursorPosition(null)
    stopScroll()
}

const getParent = () => {
    return props.parentContext
}

const getRoot = () => {
    if (isRoot.value) return currentContext

    return props.rootContext
}

const getNodeSiblings = (nodes, path): TreeNode<T>[] => {
    if (path.length === 1) return nodes
    return getNodeSiblings(nodes[path[0]].children, path.slice(1))
}

const updateNode = ({ path, patch }) => {
    if (!isRoot.value) {
        emit('updateNode', { path, patch })
        return
    }

    const pathStr = JSON.stringify(path)
    const newNodes = copy(currentValue.value)
    traverse((node, nodeModel) => {
        if (node.pathStr !== pathStr) return
        deepMerge(nodeModel, patch)
        return false // stop traverse because we found the node.
    }, newNodes)

    emitInput(newNodes)
}

const getSelected = () => {
    const selectedNodes: TreeNode<T>[] = []
    traverse((node) => {
        if (node.isSelected) selectedNodes.push(node)
    })
    return selectedNodes
}
/**
 * Check if node is a child of another node
 * @param {TreeNode} source
 * @param {TreeNode} target
 * @returns {boolean}
*/
const isChild = (source: TreeNode<T>, target: TreeNode<T>) => {
    return JSON.stringify(source.path.slice(0, target.path.length)) === target.pathStr
}

const getDraggable = () => {
    const selectedNodes: TreeNode<T>[] = []
    traverse((node) => {
        if (node.isSelected && node.isDraggable) {
            const isChildOfSelected = selectedNodes.some((selectedNode) => isChild(node, selectedNode))
            if (!isChildOfSelected) selectedNodes.push(node)
        }
    })
    return selectedNodes
}

const traverse = (
    callback: (node: TreeNode<T>, nodeModel: NodeModel<T>, siblings: NodeModel<T>[]) => boolean | void,
    nodeModels: NodeModel<T>[] | null = null,
    parentPath: number[] = [],
): NodeModel<T>[] | boolean => {
    if (!nodeModels) nodeModels = currentValue.value

    let shouldStop = false

    const nodes: NodeModel<T>[] = []

    for (let nodeInd = 0; nodeInd < nodeModels.length; nodeInd++) {
        const nodeModel = nodeModels[nodeInd]
        const itemPath = parentPath.concat(nodeInd)
        const node = getNode(itemPath, nodeModel, nodeModels)
        shouldStop = callback(node, nodeModel, nodeModels) === false
        if (node) {
            nodes.push(node)
        }

        if (shouldStop) break

        if (nodeModel.children) {
            shouldStop = traverse(callback, nodeModel.children, itemPath) === false
            if (shouldStop) break
        }
    }

    return !shouldStop ? nodes : false
}

const traverseModels = (callback, nodeModels) => {
    let i = nodeModels.length
    while (i--) {
        const nodeModel = nodeModels[i]
        if (nodeModel.children) traverseModels(callback, nodeModel.children)
        callback(nodeModel, nodeModels, i)
    }
    return nodeModels
}

const remove = (paths) => {
    const pathsStr = paths.map((path) => JSON.stringify(path))
    const newNodes = copy(currentValue.value)
    traverse((node, nodeModel, siblings) => {
        for (const pathStr of pathsStr) {
            if (node.pathStr === pathStr) nodeModel.toBeDeleted = true
        }
    }, newNodes)

    traverseModels((nodeModel, siblings, ind) => {
        if (!nodeModel.toBeDeleted) return
        siblings.splice(ind, 1)
    }, newNodes)

    emitInput(newNodes)
}

const insertModels = (cursorPosition, nodeModels, newNodes) => {
    const positionClone = copy(cursorPosition)
    const destNode = positionClone.node
    const destSiblings = getNodeSiblings(newNodes, destNode.path)
    const destNodeModel = destSiblings[destNode.ind]

    if (positionClone.placement === 'inside') {
        destNodeModel.children = destNodeModel.children || []
        destNodeModel.children.unshift(...nodeModels)
    } else {
        const insertInd = positionClone.placement === 'before' ? destNode.ind : destNode.ind + 1

        destSiblings.splice(insertInd, 0, ...nodeModels)
    }
}

const insert = (cursorPosition, nodeModel) => {
    const nodeModels = Array.isArray(nodeModel) ? nodeModel : [nodeModel]
    const newNodes = copy(currentValue.value)

    insertModels(cursorPosition, nodeModels, newNodes)

    emitInput(newNodes)
}

const checkNodeIsParent = (sourceNode, destNode) => {
    const destNodeCopy = copy(destNode)
    const destPath = destNodeCopy.path
    return JSON.stringify(destPath.slice(0, sourceNode.path.length)) == sourceNode.pathStr
}

const copy = (entity) => {
    return JSON.parse(JSON.stringify(entity))
}

// context
const currentContext: Context<T> = {
    getRoot,
    setCursorPosition,
    currentNodes,
    cursorPosition,
    emit,
    ref: rootRef,
    onNodeMousedownHandler,
    onNodeMouseupHandler,
    onMousemoveHandler,
    getCursorPositionFromCoords,
    updateNode,
    getNode,
    traverse,
    select,
    getNodeEl,
    getFirstNode,
    getLastNode,
    getNextNode,
    getPrevNode,
    getSelected,
    insert,
    remove,
    rootCursorPosition,
    selectionSize,
}

// needed for access through refs. https://vuejs.org/guide/typescript/composition-api#typing-component-template-refs
defineExpose(currentContext)
</script>
