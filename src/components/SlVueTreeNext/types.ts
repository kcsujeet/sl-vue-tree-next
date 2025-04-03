import { ComputedRef, Ref } from 'vue'

export enum MultiSelectKey {
    CTRL = 'ctrlKey',
    META = 'metaKey',
}

export interface NodeModel<T> {
    title: string
    isLeaf?: boolean
    children?: NodeModel<T>[]
    isExpanded?: boolean
    isSelected?: boolean
    isDraggable?: boolean
    isSelectable?: boolean
    data?: T
    toBeDeleted?: boolean
}

export interface TreeNode<T> extends NodeModel<T> {
    isVisible?: boolean
    isFirstChild: boolean
    isLastChild: boolean
    ind: number
    level: number
    path: number[]
    pathStr: string
    children: TreeNode<T>[]
}

export interface CursorPosition<T> {
    node: TreeNode<T>
    placement: 'before' | 'inside' | 'after'
}

export interface VueData<T> {
    rootCursorPosition: CursorPosition<T>
    rootDraggingNode: TreeNode<T>
}

export interface SlVueTreeProps<T> {
    modelValue?: NodeModel<T>[]
    edgeSize?: number
    allowMultiselect?: boolean
    showBranches?: boolean
    level?: number
    parentInd?: number
    parentContext?: Context<T>
    rootContext?: any
    allowToggleBranch?: boolean
    multiselectKey? : MultiSelectKey[]
    scrollAreaHeight?: number
    maxScrollSpeed?: number
}

export interface Context<T> {
    getRoot: () => TreeNode<T>
    setCursorPosition: (cursorPosition: CursorPosition<T>) => void
    currentNodes: ComputedRef<TreeNode<T>[]>
    cursorPosition: ComputedRef<CursorPosition<T>>
    emit: (event: string, ...args: any[]) => void
    ref: any
    onNodeMousedownHandler: (event: MouseEvent, node: TreeNode<T>) => void
    onNodeMouseupHandler: (event: MouseEvent, node: TreeNode<T>) => void
    onMousemoveHandler: (event: MouseEvent) => void
    getCursorPositionFromCoords: (x: number, y: number) => CursorPosition<T>
    updateNode: (val: { path: number[]; patch: Partial<TreeNode<T>> }) => void
    getNode: (path: number[]) => TreeNode<T>
    traverse: (callback: (node: TreeNode<T>) => void) => void
    select: (path: number[], addToSelection?: boolean) => void
    getNodeEl: (path: number[]) => HTMLElement
    getFirstNode: () => TreeNode<T>
    getLastNode: () => TreeNode<T>
    getNextNode: (path: number[], filter?: (node: TreeNode<T>) => boolean) => TreeNode<T>
    getPrevNode: (path: number[], filter?: (node: TreeNode<T>) => boolean) => TreeNode<T>
    getSelected: () => TreeNode<T>[]
    insert: (node: TreeNode<T>, data: NodeModel<T>, placement: 'before' | 'inside' | 'after') => void
    remove: (paths?: number[][]) => void
    rootCursorPosition: Ref<CursorPosition<T>>
    selectionSize: ComputedRef<number>
}
