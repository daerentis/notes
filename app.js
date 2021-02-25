import "./node_modules/quill/dist/quill.bubble.css"
import './styles.scss'

import Vue from './node_modules/vue/dist/vue.min'
import { createStore, entries, get, set, del } from 'idb-keyval'
import moment from 'moment';
import 'moment/locale/de';
import Quill from 'quill';
import Toolbar from 'quill/modules/toolbar';
import { quillEditor } from 'vue-quill-editor'

var date = new Date();
var today = moment().format('L');

const db = createStore('notes', 'notes');

new Vue({
  el: '#app',
  components: {
    quillEditor
  },
  data: {
    content: '',
    editorOption: {
      theme: 'bubble',
      placeholder: 'Be creative ...',
      modules: {
        history: {
          delay: 2000,
          maxStack: 500,
          userOnly: true
        },
        toolbar: [
          ['bold', 'italic', 'underline'],        // toggled buttons
          ['blockquote', 'code-block'],
        
          [{ 'header': 1 }, { 'header': 2 }],               // custom button values
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
          ['clean'] 
          ['image', 'video'],
        ]         
      }
    },
    sidebar: [],
    today: today,
    active: today
  },
  
  mounted() {
    get(today, db).then((note) => this.content = note);
    this.reloadNotes();
  },
  
  methods: {
    onEditorReady(quill) {
      get(today, db).then((val) => quill.setContents(val));
      quill.focus();
    },
    
    onEditorChange({ quill, html, text }) {
      set(this.active, quill.editor.delta, db);
    },
    
    reloadNotes(callback) {
      entries(db).then((notes) => this.sidebar = notes.reverse());
    },
    
    selectNote(note) {
      get(note, db).then((val) => this.$refs.quillEditor.quill.setContents(val));
      this.active = note;
    },
    
    removeNote(note) {
      if (confirm("Are you sure you want to delete this note?") == true) {
        del(note, db).then(() => {
          this.reloadNotes()
          
          if (note == this.active)
            this.active = today
        });
      }
    }
  }
})