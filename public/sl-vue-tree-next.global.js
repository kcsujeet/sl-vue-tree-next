var ue = /* @__PURE__ */ ((f) => (f.CTRL = "ctrlKey", f.META = "metaKey", f))(ue || {});
const Le = (f, k) => {
  if (se(f) && se(k))
    for (const C in k)
      se(k[C]) ? (f[C] || Object.assign(f, { [C]: {} }), Le(f[C], k[C])) : Object.assign(f, { [C]: k[C] });
  return f;
}, se = (f) => f && typeof f == "object" && !Array.isArray(f), Ge = window.Vue.defineComponent, Te = window.Vue.renderList, _e = window.Vue.Fragment, m = window.Vue.openBlock, N = window.Vue.createElementBlock, re = window.Vue.withModifiers, Ie = window.Vue.normalizeStyle, D = window.Vue.createElementVNode, y = window.Vue.renderSlot, b = window.Vue.toDisplayString, V = window.Vue.createCommentVNode, ie = window.Vue.createTextVNode, ae = window.Vue.normalizeClass, Qe = window.Vue.resolveComponent, F = window.Vue.withCtx, Ze = window.Vue.createBlock, et = window.Vue.vShow, tt = window.Vue.withDirectives, ot = {
  ref: "nodes",
  class: "sl-vue-tree-next-nodes-list"
}, nt = ["onMousedown", "onTouchstart", "onMouseup", "onTouchend", "onContextmenu", "onDblclick", "onClick", "onDragover", "onDrop", "path"], lt = { class: "sl-vue-tree-next-gap" }, st = {
  key: 0,
  class: "sl-vue-tree-next-branch"
}, rt = { key: 0 }, it = { key: 1 }, at = { class: "sl-vue-tree-next-title" }, ut = ["onClick"], ct = { class: "sl-vue-tree-next-sidebar" }, S = window.Vue.ref, dt = window.Vue.onMounted, ft = window.Vue.onBeforeUnmount, pt = window.Vue.watchEffect, T = window.Vue.computed, ht = /* @__PURE__ */ Ge({
  __name: "SlVueTreeNext",
  props: {
    modelValue: { default: () => [] },
    edgeSize: { default: 3 },
    allowMultiselect: { type: Boolean, default: !0 },
    showBranches: { type: Boolean, default: !1 },
    level: { default: 0 },
    parentInd: { default: void 0 },
    parentContext: {},
    rootContext: {},
    allowToggleBranch: { type: Boolean, default: !0 },
    multiselectKey: { default: () => [ue.CTRL, ue.META] },
    scrollAreaHeight: { default: 70 },
    maxScrollSpeed: { default: 20 }
  },
  emits: [
    "update:modelValue",
    "select",
    "beforedrop",
    "drop",
    "toggle",
    "nodeclick",
    "nodedblclick",
    "updateNode",
    "nodecontextmenu",
    "externaldragover",
    "externaldrop"
  ],
  setup(f, { expose: k, emit: C }) {
    const c = f, ce = C, L = S(), de = S(), M = S(null), O = S(0), j = S(0), Y = S(null), $ = S(!1), B = S(!1), P = S({ x: 0, y: 0 }), z = S(!1), h = S([]), p = T(() => !c.level), fe = T(() => {
      const e = [];
      let t = c.level - 1;
      for (c.showBranches || t++; t-- > 0; ) e.push(t);
      return e;
    }), d = T(() => {
      var t;
      return p.value ? M.value : (t = te()) == null ? void 0 : t.cursorPosition.value;
    }), pe = T(() => fe.value.length), U = T(() => {
      var t, n, o, s;
      if (p.value) {
        const l = x(h.value);
        return ge(l);
      }
      return c.parentInd === null ? [] : (s = (o = (n = (t = te()) == null ? void 0 : t.currentNodes) == null ? void 0 : n.value) == null ? void 0 : o[c.parentInd]) == null ? void 0 : s.children;
    }), he = T(() => xe().length);
    T(() => ne().length), dt(() => {
      p.value && document.addEventListener("mouseup", Ce);
    }), ft(() => {
      document.removeEventListener("mouseup", Ce);
    }), pt(() => {
      h.value = c.modelValue;
    });
    const _ = (e) => {
      var t;
      if (p.value) {
        M.value = e;
        return;
      }
      (t = te()) == null || t.setCursorPosition(e);
    }, ge = (e, t = [], n = !0) => e.map((o, s) => {
      const l = t.concat(s);
      return I(l, o, e, n);
    }), I = (e, t = null, n = null, o = null) => {
      const s = e.slice(-1)[0];
      if (n = n || K(h.value, e), t = t || n && n[s] || null, o == null && (o = q == null ? void 0 : q(e)), !t) return null;
      const l = t.isExpanded == null ? !0 : !!t.isExpanded, i = t.isDraggable == null ? !0 : !!t.isDraggable, r = t.isSelectable == null ? !0 : !!t.isSelectable;
      return {
        // define the all TreeNodeModel props
        title: t.title,
        isLeaf: !!t.isLeaf,
        children: t.children ? ge(t.children, e, l) : [],
        isSelected: !!t.isSelected,
        isExpanded: l,
        isVisible: o,
        isDraggable: i,
        isSelectable: r,
        data: t.data !== void 0 ? t.data : {},
        // define the all TreeNode computed props
        path: e,
        pathStr: JSON.stringify(e),
        level: e.length,
        ind: s,
        isFirstChild: s == 0,
        isLastChild: s == ((n == null ? void 0 : n.length) ?? 0) - 1
      };
    }, q = (e) => {
      if (e.length < 2) return !0;
      let t = h.value;
      for (let n = 0; n < e.length - 1; n++) {
        let o = e[n], s = t[o];
        if (!(s.isExpanded == null ? !0 : !!s.isExpanded)) return !1;
        t = s.children || [];
      }
      return !0;
    }, H = (e) => {
      h.value = e, u().emit("update:modelValue", e);
    }, Pe = (e, t) => {
      u().emit("select", e, t);
    }, He = (e, t, n) => {
      u().emit("beforedrop", e, t, n);
    }, Re = (e, t, n) => {
      u().emit("drop", e, t, n);
    }, Ae = (e, t) => {
      u().emit("toggle", e, t);
    }, Oe = (e, t) => {
      u().emit("nodeclick", e, t);
    }, Ye = (e, t) => {
      u().emit("nodedblclick", e, t);
    }, $e = (e, t) => {
      u().emit("nodecontextmenu", e, t);
    }, ze = (e, t) => {
      t.preventDefault();
      const n = u(), o = n.getCursorPositionFromCoords(t.clientX, t.clientY);
      n.setCursorPosition(o), n.emit("externaldragover", o, t);
    }, Je = (e, t) => {
      const n = u(), o = n.getCursorPositionFromCoords(t.clientX, t.clientY);
      n.emit("externaldrop", o, t), _(null);
    }, W = (e, t = !1, n = null) => {
      const o = Array.isArray(c.multiselectKey) ? c.multiselectKey : [c.multiselectKey];
      t = (n && !!o.find((v) => n[v]) || t) && c.allowMultiselect;
      const l = I(e);
      if (!l) return null;
      const i = x(h.value), r = c.allowMultiselect && n && n.shiftKey && Y.value, a = [];
      let g = !1;
      return w((v, E) => {
        var A;
        r ? ((v.pathStr === l.pathStr || v.pathStr === ((A = Y.value) == null ? void 0 : A.pathStr)) && (E.isSelected = v.isSelectable, g = !g), g && (E.isSelected = v.isSelectable)) : v.pathStr === l.pathStr ? E.isSelected = v.isSelectable : t || E.isSelected && (E.isSelected = !1), E.isSelected && a.push(v);
      }, i), Y.value = l, H(i), Pe(a, n), l;
    }, G = (e) => {
      var Be, Ee;
      if (!p.value) {
        (Be = u()) == null || Be.onMousemoveHandler(e);
        return;
      }
      if (z.value) return;
      e.type === "touchmove" && (e.preventDefault(), e.clientX = e.touches[0].clientX, e.clientY = e.touches[0].clientY);
      const t = B.value, n = t || $.value && (P.value.x !== e.clientX || P.value.y !== e.clientY), o = t === !1 && n === !0;
      if (P.value = {
        x: e.clientX,
        y: e.clientY
      }, !n) return;
      const s = u().ref.value, l = s.getBoundingClientRect(), i = e.clientY - l.top + s.scrollTop - Number(((Ee = L.value) == null ? void 0 : Ee.style.marginBottom) ?? 0), r = e.clientX - l.left;
      L.value && (L.value.style.top = i + "px", L.value.style.left = r + "px");
      const a = ve(e.clientX, e.clientY), g = a == null ? void 0 : a.node, v = a == null ? void 0 : a.placement;
      if (o && !g.isSelected && W(g.path, !1, e), !ne().length) {
        z.value = !0;
        return;
      }
      B.value = n, _({ node: g, placement: v });
      const A = l.bottom - c.scrollAreaHeight, De = (e.clientY - A) / (l.bottom - A), Ve = l.top + c.scrollAreaHeight, ke = (Ve - e.clientY) / (Ve - l.top);
      De > 0 ? ye(De) : ke > 0 ? ye(-ke) : ee();
    }, ve = (e, t) => {
      const n = document.elementFromPoint(e, t), o = n != null && n.getAttribute("path") ? n : me(n);
      let s, l;
      if (o) {
        if (!o) return;
        s = I(JSON.parse(o.getAttribute("path")));
        const i = o.offsetHeight, r = c.edgeSize, a = t - o.getBoundingClientRect().top;
        s.isLeaf ? l = a >= i / 2 ? "after" : "before" : a <= r ? l = "before" : a >= i - r ? l = "after" : l = "inside";
      } else {
        const r = u().ref.value.getBoundingClientRect();
        t > r.top + r.height / 2 ? (l = "after", s = we()) : (l = "before", s = Q());
      }
      return { node: s, placement: l };
    }, me = (e) => e ? e.getAttribute("path") ? e : me(e.parentElement) : null, Se = (e) => {
      if (!p.value || !B.value) return;
      const n = u().ref.value.getBoundingClientRect();
      if (e.type === "touchcancel" && (e.clientX = P.value.x, e.clientY = P.value.y), e.clientY >= n.bottom) {
        const o = structuredClone(U.value);
        _({ node: o[0], placement: "after" });
      } else e.clientY < n.top && _({ node: Q(), placement: "before" });
    }, Ke = (e) => u().ref.value.querySelector(`[path="${JSON.stringify(e)}"]`), we = () => {
      let e = null;
      return w((t) => {
        e = t;
      }), e;
    }, Q = () => I([0]), Xe = (e, t) => {
      let n = null;
      return w((o) => {
        if (!(Ne(o.path, e) < 1) && (!t || t(o)))
          return n = o, !1;
      }), n;
    }, Fe = (e, t) => {
      let n = [];
      w((s) => {
        if (Ne(s.path, e) >= 0)
          return !1;
        n.push(s);
      });
      let o = n.length;
      for (; o--; ) {
        const s = n[o];
        if (!t || t(s)) return s;
      }
      return null;
    }, Ne = (e, t) => {
      for (let n = 0; n < e.length; n++) {
        if (t[n] == null || e[n] > t[n]) return 1;
        if (e[n] < t[n]) return -1;
      }
      return t[e.length] == null ? 0 : -1;
    }, Z = (e, t) => {
      if (!(e.type == "mousedown" && e.button !== 0)) {
        if (!p.value) {
          u().onNodeMousedownHandler(e, t);
          return;
        }
        $.value = !0;
      }
    }, ye = (e) => {
      const t = u().ref.value;
      j.value !== e && (O.value && ee(), j.value = e, O.value = setInterval(() => {
        t.scrollTop += c.maxScrollSpeed * e;
      }, 20));
    }, ee = () => {
      clearInterval(O.value), O.value = 0, j.value = 0;
    }, Ce = (e) => {
      B.value && J(e);
    }, J = (e, t = null) => {
      if (e.type == "mouseup" && e.button !== 0) return;
      if (!p.value) {
        u().onNodeMouseupHandler(e, t);
        return;
      }
      if ($.value = !1, !B.value && t && !z.value && W(t.path, !1, e), z.value = !1, !d.value) {
        R();
        return;
      }
      const n = ne();
      for (let r of n) {
        if (r.pathStr == d.value.node.pathStr) {
          R();
          return;
        }
        if (We(r, d.value.node)) {
          R();
          return;
        }
      }
      const o = x(h.value), s = [];
      for (let r of n) {
        const g = K(o, r.path)[r.ind];
        s.push(g);
      }
      let l = !1;
      if (He(n, d.value, () => l = !0), l) {
        R();
        return;
      }
      const i = [];
      for (let r of s)
        i.push(x(r)), r.toBeDeleted = !0;
      be(d.value, i, o), le((r, a, g) => {
        r.toBeDeleted && a.splice(g, 1);
      }, o), Y.value = null, H(o), Re(n, d.value, e), R();
    }, Me = (e, t) => {
      c.allowToggleBranch && (oe({ path: t.path, patch: { isExpanded: !t.isExpanded } }), Ae(t, e), e.stopPropagation());
    }, R = () => {
      B.value = !1, $.value = !1, _(null), ee();
    }, te = () => c.parentContext, u = () => p.value ? X : c.rootContext, K = (e, t) => t.length === 1 ? e : K(e[t[0]].children, t.slice(1)), oe = ({ path: e, patch: t }) => {
      if (!p.value) {
        ce("updateNode", { path: e, patch: t });
        return;
      }
      const n = JSON.stringify(e), o = x(h.value);
      w((s, l) => {
        if (s.pathStr === n)
          return Le(l, t), !1;
      }, o), H(o);
    }, xe = () => {
      const e = [];
      return w((t) => {
        t.isSelected && e.push(t);
      }), e;
    }, je = (e, t) => JSON.stringify(e.path.slice(0, t.path.length)) === t.pathStr, ne = () => {
      const e = [];
      return w((t) => {
        t.isSelected && t.isDraggable && (e.some((o) => je(t, o)) || e.push(t));
      }), e;
    }, w = (e, t = null, n = []) => {
      t || (t = h.value);
      let o = !1;
      const s = [];
      for (let l = 0; l < t.length; l++) {
        const i = t[l], r = n.concat(l), a = I(r, i, t);
        if (o = e(a, i, t) === !1, a && s.push(a), o || i.children && (o = w(e, i.children, r) === !1, o))
          break;
      }
      return o ? !1 : s;
    }, le = (e, t) => {
      let n = t.length;
      for (; n--; ) {
        const o = t[n];
        o.children && le(e, o.children), e(o, t, n);
      }
      return t;
    }, Ue = (e) => {
      const t = e.map((o) => JSON.stringify(o)), n = x(h.value);
      w((o, s, l) => {
        for (const i of t)
          o.pathStr === i && (s.toBeDeleted = !0);
      }, n), le((o, s, l) => {
        o.toBeDeleted && s.splice(l, 1);
      }, n), H(n);
    }, be = (e, t, n) => {
      const o = x(e), s = o.node, l = K(n, s.path), i = l[s.ind];
      if (o.placement === "inside")
        i.children = i.children || [], i.children.unshift(...t);
      else {
        const r = o.placement === "before" ? s.ind : s.ind + 1;
        l.splice(r, 0, ...t);
      }
    }, qe = (e, t) => {
      const n = Array.isArray(t) ? t : [t], o = x(h.value);
      be(e, n, o), H(o);
    }, We = (e, t) => {
      const o = x(t).path;
      return JSON.stringify(o.slice(0, e.path.length)) == e.pathStr;
    }, x = (e) => JSON.parse(JSON.stringify(e)), X = {
      getRoot: u,
      setCursorPosition: _,
      currentNodes: U,
      cursorPosition: d,
      emit: ce,
      ref: de,
      onNodeMousedownHandler: Z,
      onNodeMouseupHandler: J,
      onMousemoveHandler: G,
      getCursorPositionFromCoords: ve,
      updateNode: oe,
      getNode: I,
      traverse: w,
      select: W,
      getNodeEl: Ke,
      getFirstNode: Q,
      getLastNode: we,
      getNextNode: Xe,
      getPrevNode: Fe,
      getSelected: xe,
      insert: qe,
      remove: Ue,
      rootCursorPosition: M,
      selectionSize: he
    };
    return k(X), (e, t) => {
      const n = Qe("SlVueTreeNext", !0);
      return m(), N("div", {
        ref_key: "rootRef",
        ref: de,
        class: ae(["sl-vue-tree-next", { "sl-vue-tree-next-root": p.value }]),
        onMousemove: G,
        onTouchmove: G,
        onMouseleave: Se,
        onTouchcancel: Se
      }, [
        D("div", ot, [
          (m(!0), N(_e, null, Te(U.value, (o, s) => (m(), N("div", {
            class: ae(["sl-vue-tree-next-node", { "sl-vue-tree-next-selected": o.isSelected }])
          }, [
            D("div", {
              class: "sl-vue-tree-next-cursor sl-vue-tree-next-cursor_before",
              onDragover: t[0] || (t[0] = re(() => {
              }, ["prevent"])),
              style: Ie({
                visibility: d.value && d.value.node.pathStr === o.pathStr && d.value.placement === "before" ? "visible" : "hidden",
                "--depth": pe.value
              })
            }, null, 36),
            D("div", {
              class: ae(["sl-vue-tree-next-node-item", {
                "sl-vue-tree-next-cursor-hover": d.value && d.value.node.pathStr === o.pathStr,
                "sl-vue-tree-next-cursor-inside": d.value && d.value.placement === "inside" && d.value.node.pathStr === o.pathStr,
                "sl-vue-tree-next-node-is-leaf": o.isLeaf,
                "sl-vue-tree-next-node-is-folder": !o.isLeaf
              }]),
              onMousedown: (l) => Z(l, o),
              onTouchstart: (l) => Z(l, o),
              onMouseup: (l) => J(l, o),
              onTouchend: (l) => J(l, o),
              onContextmenu: (l) => $e(o, l),
              onDblclick: (l) => Ye(o, l),
              onClick: (l) => Oe(o, l),
              onDragover: (l) => ze(o, l),
              onDrop: (l) => Je(o, l),
              path: o.pathStr
            }, [
              (m(!0), N(_e, null, Te(fe.value, (l) => (m(), N("div", lt))), 256)),
              e.level && e.showBranches ? (m(), N("div", st, [
                y(e.$slots, "branch", { node: o }, () => [
                  o.isLastChild ? V("", !0) : (m(), N("span", rt, b("├") + b("─") + "  ", 1)),
                  o.isLastChild ? (m(), N("span", it, b("└") + b("─") + "  ", 1)) : V("", !0)
                ])
              ])) : V("", !0),
              D("div", at, [
                o.isLeaf ? V("", !0) : (m(), N("span", {
                  key: 0,
                  class: "sl-vue-tree-next-toggle",
                  onClick: (l) => Me(l, o)
                }, [
                  y(e.$slots, "toggle", { node: o }, () => [
                    D("span", null, b(o.isLeaf ? "" : o.isExpanded ? "-" : "+"), 1)
                  ])
                ], 8, ut)),
                y(e.$slots, "title", { node: o }, () => [
                  ie(b(o.title), 1)
                ]),
                !o.isLeaf && o.children.length == 0 && o.isExpanded ? y(e.$slots, "empty-node", {
                  key: 1,
                  node: o
                }) : V("", !0)
              ]),
              D("div", ct, [
                y(e.$slots, "sidebar", { node: o })
              ])
            ], 42, nt),
            o.children && o.children.length && o.isExpanded ? (m(), Ze(n, {
              key: 0,
              "model-value": o.children,
              level: o.level,
              "parent-ind": s,
              "allow-multiselect": e.allowMultiselect,
              "allow-toggle-branch": e.allowToggleBranch,
              "edge-size": e.edgeSize,
              "show-branches": e.showBranches,
              "parent-context": X,
              "root-context": p.value ? X : e.rootContext,
              onUpdateNode: oe,
              onDragover: t[1] || (t[1] = re(() => {
              }, ["prevent"]))
            }, {
              title: F(({ node: l }) => [
                y(e.$slots, "title", { node: l }, () => [
                  ie(b(l.title), 1)
                ])
              ]),
              toggle: F(({ node: l }) => [
                y(e.$slots, "toggle", { node: l }, () => [
                  D("span", null, b(l.isLeaf ? "" : l.isExpanded ? "-" : "+"), 1)
                ])
              ]),
              sidebar: F(({ node: l }) => [
                y(e.$slots, "sidebar", { node: l })
              ]),
              "empty-node": F(({ node: l }) => [
                !l.isLeaf && l.children.length == 0 && l.isExpanded ? y(e.$slots, "empty-node", {
                  key: 0,
                  node: l
                }) : V("", !0)
              ]),
              _: 2
            }, 1032, ["model-value", "level", "parent-ind", "allow-multiselect", "allow-toggle-branch", "edge-size", "show-branches", "root-context"])) : V("", !0),
            D("div", {
              class: "sl-vue-tree-next-cursor sl-vue-tree-next-cursor_after",
              onDragover: t[2] || (t[2] = re(() => {
              }, ["prevent"])),
              style: Ie({
                visibility: d.value && d.value.node.pathStr === o.pathStr && d.value.placement === "after" ? "visible" : "hidden",
                "--depth": pe.value
              })
            }, null, 36)
          ], 2))), 256)),
          p.value ? tt((m(), N("div", {
            key: 0,
            ref_key: "dragInfoRef",
            ref: L,
            class: "sl-vue-tree-next-drag-info"
          }, [
            y(e.$slots, "draginfo", {}, () => [
              ie(" Items: " + b(he.value), 1)
            ])
          ], 512)), [
            [et, B.value]
          ]) : V("", !0)
        ], 512)
      ], 34);
    };
  }
});
export {
  ht as SlVueTreeNext
};
