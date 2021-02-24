import "./node_modules/quill/dist/quill.bubble.css"
import './styles.scss'

import { createStore, entries, get, set } from 'idb-keyval'
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
          [{ 'align': [] }],
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
    this.loadEntries((notes) => this.sidebar = notes.reverse());
  },
    
  /*
  watch: {
    content(newContent) {
      set(this.active, newContent, db);
      entries(db).then((val) => this.sidebar = val.reverse());
    }
  },
  */
  
  methods: {
    loadEntries(callback) {
      console.log('loadEntrie()');
      entries(db).then(callback);
    },
    
    selectNote(event) {
      get(event.srcElement.innerHTML, db).then((val) => this.$refs.myTextEditor.quill.setContents(val));
      this.active = event.srcElement.innerHTML;
    },
     
    onEditorReady(quill) {
      get(today, db).then((val) => quill.setContents(val));
      quill.focus();
    },
    
    onEditorChange({ quill, html, text }) {
      set(this.active, quill.editor.delta, db);
    }
  }
})