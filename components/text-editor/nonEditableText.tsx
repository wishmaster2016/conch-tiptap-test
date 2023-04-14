import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import mixpanel from 'mixpanel-browser'

import Component from './nonEditableTextView.jsx'

export default Node.create({
  name: 'reactComponent',

  //change block to inline but getting "SyntaxError: Mixing inline and block content (in content expression 'inline*')"
  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'react-component',
      },
    ]
  },

  addKeyboardShortcuts() {
    return {
      'ArrowRight': () => {
        if (window.location.pathname.includes("app")) {
          mixpanel.track("typed arrow right");
        } else {
          mixpanel.track("Demo typed arrow right");
        }
        
        if(!window.getSelection()?.toString()) {
          const text = localStorage.getItem("nextSentenceText") || "";

          if(this.editor.commands.deleteNode("reactComponent")){
            this.editor.commands.insertContent(" " + text)
          }else{
            this.editor.chain().focus().setTextSelection(this.editor.view.state.selection.$anchor.pos + 1).run()
          }
        }
        return true;
      },
      'Tab': () => {
        if (window.location.pathname.includes("app")) {
          mixpanel.track("typed tab");
        } else {
          mixpanel.track("Demo typed ");
        }

        if(!window.getSelection()?.toString()){
          const text = localStorage.getItem("nextSentenceText") || "";

          if(this.editor.commands.deleteNode("reactComponent")){
            this.editor.commands.insertContent(text)
          }else{
            this.editor.commands.setHardBreak()
          }
        }
        
        return true;
      },
      'Mod-j': () => {
        if(!window.getSelection()?.toString()){
          this.editor.commands.insertContent(`<react-component></react-component>`);
        }
        return true;
      }
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['react-component', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component)
  },
})