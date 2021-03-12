import "./node_modules/quill/dist/quill.bubble.css"
import './styles.scss'

import Vue from './node_modules/vue/dist/vue.min'
import Dexie from 'dexie';
import lunr from 'lunr';
import moment from 'moment';
import 'moment/locale/de';
import Quill from 'quill';
import Toolbar from 'quill/modules/toolbar';
import { quillEditor } from 'vue-quill-editor'

var date = new Date();
var today = moment().format('L');

var db = new Dexie("notes2");
db.version(1).stores({
  notes: "++id, date, content",
});

new Vue({
  el: '#app',
  components: {
    quillEditor
  },
  data: {
    query: '',
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
          ['bold', 'italic', 'underline'],
          ['blockquote', 'code-block'],        
          [{ 'header': 1 }, { 'header': 2 }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          ['clean'],
          ['image', 'video'],
        ]         
      }
    },
    sidebar: [],
    marked: [],
    today: today,
    active: today
  },
    
  mounted() {
    this.reloadNotes();
  },
  
  methods: {    
    onEditorReady(quill) {
      db.notes.get({date: today}).then((note) => {
        quill.setContents(note.content)
        quill.focus();
      });
    },
    
    onEditorChange({ quill, html, text }) {
      db.transaction('r', db.notes, () => {
        return db.notes.get({date: this.active});
      }).then((note) => {
        if (note == undefined)
          db.notes.put({date: this.active, content: quill.editor.delta});
        else
          db.notes.update(note.id, { content: quill.editor.delta });
      });
    },
    
    reloadNotes() {
      this.sidebar = [];
      db.notes.each((note) => {
        this.sidebar.push(note);
      })
    },
    
    selectNote(date) {
      db.notes.get({date: date}).then((note) => {
        if (note == undefined)
          this.$refs.quillEditor.quill.setContents('');
        else
          this.$refs.quillEditor.quill.setContents(note.content);
      
        this.active = date;
      });
      this.active = date;
    },
    
    searchNote() {
      var query = this.query;
      var notes = [];
      var sidebar = this.sidebar;
      
      if (query) {
        db.notes.each((note)  => {
          note.content = JSON.stringify(note.content).replace(/\{|\}|\[|\]|:|"|,|(\\n)|ops/gm, ' ');
          notes.push(note);
        }).then(() => {
          var idx = lunr(function () {
            this.field('date')
            this.field('content')
            
            notes.forEach(function (note) {
              this.add(note)
            }, this);
          })
          return idx.search(query);
        }).then((results) => {
          if (results) {
            this.marked = [];
            this.sidebar.forEach((element) => {
              results.forEach((result) => {
                this.marked[element.id] = (element.id == result.ref)
              })
            })  
          }
        })
     }
    },
    
    removeNote(note) {
      if (confirm("Are you sure you want to delete this note?") == true) {
        db.notes.delete(note.id).then(() => {
          this.reloadNotes()
          
          if (note.date == this.active)
            this.active = today;
        });
      }
    }
  }
})